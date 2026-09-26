import re
from urllib.parse import urlparse

# Map of major brands to their official primary domain names
BRAND_MAP = {
    "google": {"name": "Google", "domains": ["google.com", "gmail.com", "google.co.in", "accounts.google.com"]},
    "microsoft": {"name": "Microsoft", "domains": ["microsoft.com", "office.com", "outlook.com", "live.com"]},
    "amazon": {"name": "Amazon", "domains": ["amazon.com", "amazon.in", "aws.amazon.com"]},
    "paypal": {"name": "PayPal", "domains": ["paypal.com", "paypal.in"]},
    "sbi": {"name": "State Bank of India (SBI)", "domains": ["onlinesbi.sbi", "sbi.co.in"]},
    "hdfc": {"name": "HDFC Bank", "domains": ["hdfcbank.com", "hdfc.com"]},
    "icici": {"name": "ICICI Bank", "domains": ["icicibank.com"]},
    "axis": {"name": "Axis Bank", "domains": ["axisbank.com"]},
    "instagram": {"name": "Instagram", "domains": ["instagram.com"]},
    "facebook": {"name": "Facebook", "domains": ["facebook.com", "fb.com"]},
    "netflix": {"name": "Netflix", "domains": ["netflix.com"]}
}

def levenshtein_distance(s1, s2):
    """
    Standard dynamic programming Levenshtein distance
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
        
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
        
    return previous_row[-1]

def extract_domain(url):
    """
    Safely extract domain from a URL string
    """
    try:
        # If URL doesn't have scheme, prepend double slashes for urllib parsing
        if not re.match(r'^[a-zA-Z]+://', url):
            url = "//" + url
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]
        # Remove port numbers if any
        domain = domain.split(':')[0]
        # Lowercase and strip www
        domain = domain.lower().strip()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return url.lower().strip()

def check_brand_impersonation(url):
    """
    Analyze if a domain is impersonating a well-known brand
    Returns dict with analysis details
    """
    target_domain = extract_domain(url)
    if not target_domain:
        return {"is_impersonation": False, "brand": None, "reason": None}

    # Extract target domain parts (e.g., in paypal-verify.com, parts are paypal-verify, com)
    domain_parts = target_domain.split('.')
    if len(domain_parts) < 2:
        return {"is_impersonation": False, "brand": None, "reason": None}
        
    sld = domain_parts[-2] # Second Level Domain (e.g., 'paypal-verify')
    
    # 1. Direct Substring Check: Keyword matches official brand but domain doesn't match official whitelist
    for brand_key, brand_info in BRAND_MAP.items():
        # Check if brand keyword is inside the domain string
        if brand_key in target_domain:
            # Check if domain is in the official list
            is_official = False
            for official_dom in brand_info["domains"]:
                if target_domain == official_dom or target_domain.endswith("." + official_dom):
                    is_official = True
                    break
            
            if not is_official:
                return {
                    "is_impersonation": True,
                    "brand": brand_info["name"],
                    "similarity_percentage": 100.0,
                    "official_domain": brand_info["domains"][0],
                    "reason": f"Suspicious usage of brand keyword '{brand_key}' on non-official domain."
                }

    # 2. Typo-squatting / Similarity Check: Compare SLD with brand names using Levenshtein distance
    # e.g., 'goog1e' vs 'google', 'paypa1' vs 'paypal'
    for brand_key, brand_info in BRAND_MAP.items():
        # Remove non-alphanumeric chars for distance checks
        clean_sld = re.sub(r'[^a-zA-Z0-9]', '', sld)
        clean_brand = re.sub(r'[^a-zA-Z0-9]', '', brand_key)
        
        distance = levenshtein_distance(clean_sld, clean_brand)
        
        # If distance is small (1 or 2 edits) and length is comparable
        if 0 < distance <= 2 and abs(len(clean_sld) - len(clean_brand)) <= 2:
            similarity = round((1 - (distance / max(len(clean_sld), len(clean_brand)))) * 100, 1)
            return {
                "is_impersonation": True,
                "brand": brand_info["name"],
                "similarity_percentage": similarity,
                "official_domain": brand_info["domains"][0],
                "reason": f"Typo-squatting detected. The domain '{clean_sld}' is very similar to official brand '{brand_key}' (distance={distance})."
            }

    return {"is_impersonation": False, "brand": None, "reason": None}
