import re
import math
from urllib.parse import urlparse

# Keywords and regex patterns
URGENT_WORDS = {"now", "immediately", "block", "verify", "suspend", "urgent", "expire", "restrict", "action", "unauthorized", "lock", "cancel", "alert"}
CREDENTIAL_WORDS = {"password", "credentials", "login", "signin", "pin", "cvv", "card", "ssn", "credentials", "access"}
BANK_WORDS = {"bank", "billing", "netbanking", "transfer", "transaction", "otp", "wire", "invoice", "refund"}
RISKY_TLDS = {".xyz", ".top", ".club", ".work", ".info", ".online", ".net", ".cc", ".icu", ".click", ".gq", ".tk", ".cf", ".ml", ".ga"}
OFFICIAL_BRANDS = ["google", "microsoft", "amazon", "paypal", "instagram", "facebook", "netflix", "sbi", "hdfc", "icici", "axis"]

def calculate_entropy(text):
    if not text:
        return 0.0
    entropy = 0.0
    for x in set(text):
        p_x = float(text.count(x)) / len(text)
        entropy -= p_x * math.log2(p_x)
    return entropy

def extract_text_features(text):
    text_lower = text.lower()
    length = len(text)
    if length == 0:
        return {
            "length": 0, "uppercase_ratio": 0.0, "has_url": 0, "num_urls": 0,
            "urgent_word_count": 0, "credential_request": 0, "otp_request": 0,
            "bank_keyword_count": 0, "email_count": 0, "digit_ratio": 0.0, "special_ratio": 0.0
        }

    # Uppercase ratio
    uppercase_count = sum(1 for c in text if c.isupper())
    uppercase_ratio = uppercase_count / length

    # URLs count
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', text)
    num_urls = len(urls)
    has_url = 1 if num_urls > 0 else 0

    # Urgent words
    words = re.findall(r'\b\w+\b', text_lower)
    urgent_count = sum(1 for w in words if w in URGENT_WORDS)

    # Credential requests
    cred_req = 1 if any(w in text_lower for w in CREDENTIAL_WORDS) else 0

    # OTP requests
    otp_req = 1 if any(x in text_lower for x in ["otp", "one-time", "one time password", "verification code", "verify pin"]) else 0

    # Bank keywords
    bank_count = sum(1 for w in words if w in BANK_WORDS)

    # Email addresses
    emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email_count = len(emails)

    # Digit ratio
    digit_count = sum(1 for c in text if c.isdigit())
    digit_ratio = digit_count / length

    # Special symbols ratio
    special_count = sum(1 for c in text if not c.isalnum() and not c.isspace())
    special_ratio = special_count / length

    return {
        "length": length,
        "uppercase_ratio": uppercase_ratio,
        "has_url": has_url,
        "num_urls": num_urls,
        "urgent_word_count": urgent_count,
        "credential_request": cred_req,
        "otp_request": otp_req,
        "bank_keyword_count": bank_count,
        "email_count": email_count,
        "digit_ratio": digit_ratio,
        "special_ratio": special_ratio
    }

def extract_url_features(url):
    # Parse URL
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if not domain and parsed.path:
            domain = parsed.path.split('/')[0]
    except Exception:
        domain = url

    domain_lower = domain.lower()
    
    # Feature 1: URL Length
    length = len(url)
    
    # Feature 2: HTTPS
    is_https = 1 if url.lower().startswith("https") else 0

    # Feature 3: Has IP address in domain
    has_ip = 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain_lower) else 0

    # Feature 4: Subdomain Count (excluding 'www')
    parts = domain_lower.split('.')
    if parts and parts[0] == 'www':
        parts = parts[1:]
    subdomain_count = max(0, len(parts) - 2)

    # Feature 5: Hyphen count in domain
    hyphen_count = domain_lower.count('-')

    # Feature 6: Suspicious Keywords in domain or path
    suspicious_count = sum(1 for kw in OFFICIAL_BRANDS + list(URGENT_WORDS) if kw in url.lower())

    # Feature 7: Digit Ratio in Domain
    digits = sum(1 for c in domain_lower if c.isdigit())
    digit_ratio = digits / len(domain_lower) if domain_lower else 0.0

    # Feature 8: Domain Entropy
    entropy = calculate_entropy(domain_lower)

    # Feature 9: Risky TLD
    tld_risk = 0
    for risky in RISKY_TLDS:
        if domain_lower.endswith(risky):
            tld_risk = 1
            break

    # Feature 10: Brand Impersonation check
    brand_impersonation = 0
    # Check if a brand name is in the domain name, but the domain doesn't end with their official domains
    # Simple check: if "paypal" in domain, but not exactly "paypal.com" or "www.paypal.com"
    for brand in OFFICIAL_BRANDS:
        if brand in domain_lower:
            # check if it's official
            is_official = False
            if brand == "sbi" and domain_lower.endswith("onlinesbi.sbi"):
                is_official = True
            elif brand == "hdfc" and (domain_lower.endswith("hdfcbank.com") or domain_lower.endswith("hdfc.com")):
                is_official = True
            elif domain_lower.endswith(f"{brand}.com") or domain_lower.endswith(f"www.{brand}.com"):
                is_official = True
            
            if not is_official:
                brand_impersonation = 1
                break

    return {
        "length": length,
        "is_https": is_https,
        "has_ip": has_ip,
        "subdomain_count": subdomain_count,
        "hyphen_count": hyphen_count,
        "suspicious_count": suspicious_count,
        "digit_ratio": digit_ratio,
        "entropy": entropy,
        "tld_risk": tld_risk,
        "brand_impersonation": brand_impersonation
    }
