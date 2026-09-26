import os
import csv
import random

# Ensure directories exist
os.makedirs("datasets", exist_ok=True)
os.makedirs("ml_model", exist_ok=True)

# 1. GENERATE SYNTHETIC TEXT DATA (Emails/SMS/WhatsApp)
PHISHING_TEMPLATES = [
    "URGENT: Your {bank} account has been suspended due to suspicious activity. Verify your identity immediately at {url} to restore access.",
    "Dear customer, we detected a login attempt from an unknown device. If this was not you, secure your account now by visiting {url}.",
    "Congratulations! You have won a {prize} gift card. Claim your reward within 24 hours at this link: {url}.",
    "ALERT: Your password for {service} is expiring in 2 hours. Log in at {url} immediately to update your credentials and prevent lockout.",
    "Action Required: We found an unauthorized transaction of {amount} on your card. Verify details here to cancel: {url}.",
    "Verify your mobile banking PIN now. Failure to do so will result in temporary block. Click: {url}.",
    "Your tax refund of {amount} is ready. Fill out the application form with your bank details at {url} to claim.",
    "Security Alert: Google detected a suspicious sign-in on your account. Please confirm your identity here: {url}.",
    "URGENT! {bank} NetBanking alert. Your OTP for transaction of {amount} is {otp}. If you did not request this, cancel immediately at {url}.",
    "Hi, this is Instagram Support. Your profile is violating copyright rules. Appeal now to avoid deletion: {url}.",
    "Amazon: Your order #{order_id} of {amount} was successfully placed. If you did not make this purchase, click here to dispute: {url}.",
    "Verify your Whatsapp identity now or your profile will be deactivated. Link: {url}.",
]

SAFE_TEMPLATES = [
    "Hey, are we still meeting for lunch at {time} today? Let me know.",
    "Hi team, please find attached the weekly project status report. Let me know if you have any questions.",
    "Your order #{order_id} from {brand} has been shipped and will arrive by {date}. Track your package: {url}",
    "Thanks for subscribing to our newsletter! Here is your discount code for your next purchase: {code}.",
    "Hi {name}, I loved your presentation today. Can you share the slides when you get a chance?",
    "Reminder: Your appointment with {doctor} is scheduled for {time} tomorrow. Please reply YES to confirm.",
    "Here is the receipt for your monthly payment of {amount} to {service}. Thank you for your business.",
    "Let's review the code changes tomorrow morning. I left some comments on your PR.",
    "Hi, can you send me the contact details for {name}? I need to coordinate the event.",
    "Hey! Just checking in to see how you're doing. Let's catch up this weekend.",
]

BANKS = ["HDFC", "SBI", "ICICI", "Axis Bank", "Chase", "PayPal", "Bank of America"]
SERVICES = ["Netflix", "Amazon", "Instagram", "Facebook", "Microsoft", "Google", "PayPal"]
PRIZES = ["$1000 Walmart", "iPhone 15 Pro", "$500 Amazon", "Free Bitcoin"]
BRANDS = ["Amazon", "Flipkart", "Nike", "Apple", "Google"]

PHISHING_URLS = [
    "http://secure-login-hdfc.xyz", "https://sbi-netbanking-verify.net", "http://paypal-verification-alert.com",
    "http://192.168.1.105/login.html", "https://instagram-copyright-appeal.xyz", "http://netflix-billing-update.top",
    "https://microsoft-login-verify.club", "http://secure-axis-portal.info", "https://amazon-security-login.xyz",
    "http://whatsapp-verification.online", "http://verification-sbi-portal.top", "http://login-google-support.net"
]

SAFE_URLS = [
    "https://www.onlinesbi.sbi", "https://www.hdfcbank.com", "https://www.icicibank.com",
    "https://www.paypal.com", "https://www.instagram.com", "https://www.netflix.com",
    "https://www.microsoft.com", "https://www.amazon.com", "https://www.google.com",
    "https://github.com", "https://stackoverflow.com", "https://www.wikipedia.org"
]

def generate_text_dataset():
    data = []
    # Generate Phishing Examples
    for i in range(1000):
        template = random.choice(PHISHING_TEMPLATES)
        text = template.format(
            bank=random.choice(BANKS),
            service=random.choice(SERVICES),
            url=random.choice(PHISHING_URLS) + f"/login?id={random.randint(1000, 9999)}",
            prize=random.choice(PRIZES),
            amount=f"${random.randint(10, 5000)}" if random.random() > 0.5 else f"Rs. {random.randint(500, 50000)}",
            otp=random.randint(100000, 999999),
            order_id=random.randint(100000, 999999)
        )
        # Add random variations to increase robust training
        if random.random() > 0.5:
            text = text.upper()
        data.append((text, "Phishing"))

    # Generate Safe Examples
    for i in range(1000):
        template = random.choice(SAFE_TEMPLATES)
        text = template.format(
            name=random.choice(["Alex", "Sarah", "John", "David", "Emily"]),
            time=f"{random.randint(1, 12)}:{random.choice(['00', '30'])} {random.choice(['AM', 'PM'])}",
            order_id=random.randint(100000, 999999),
            brand=random.choice(BRANDS),
            date=f"{random.randint(1, 28)} Oct",
            url=random.choice(SAFE_URLS),
            code=f"WELCOME{random.randint(10, 50)}",
            doctor=random.choice(["Dr. Smith", "Dr. Jones", "Dr. Gupta"]),
            amount=f"${random.randint(5, 100)}" if random.random() > 0.5 else f"Rs. {random.randint(100, 2000)}",
            service=random.choice(["Spotify", "Netflix", "Youtube Premium", "Google One"])
        )
        data.append((text, "Safe"))

    # Write to CSV
    csv_path = "datasets/synthetic_phishing_emails.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        writer.writerows(data)
    print(f"Text dataset generated successfully with {len(data)} records at {csv_path}.")


# 2. GENERATE SYNTHETIC URL DATA
SUSPICIOUS_KEYWORDS = ["secure", "login", "verify", "update", "bank", "account", "signin", "support", "billing", "free", "gift"]
SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".work", ".info", ".online", ".net", ".xyz", ".cc", ".icu", ".click"]
SAFE_DOMAINS = ["google.com", "microsoft.com", "amazon.com", "paypal.com", "instagram.com", "netflix.com", "github.com", "apple.com", "wikipedia.org"]

def generate_url_dataset():
    data = []
    # Phishing/Suspicious URLs
    for _ in range(1200):
        # Format 1: Subdomain spoofing
        # e.g., paypal.com.verify-login.xyz
        brand = random.choice(["paypal", "sbi", "hdfc", "amazon", "google", "instagram", "netflix"])
        kw = random.choice(SUSPICIOUS_KEYWORDS)
        tld = random.choice(SUSPICIOUS_TLDS)
        
        path = f"/login?user={random.randint(10000, 99999)}" if random.random() > 0.3 else ""
        
        mode = random.randint(1, 4)
        if mode == 1:
            url = f"https://{brand}.com.{kw}-access{tld}{path}"
        elif mode == 2:
            url = f"http://{kw}-{brand}-verification-service{tld}{path}"
        elif mode == 3:
            # IP address URL
            url = f"http://{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}/{kw}"
        else:
            # Shortener style or random string TLD
            random_str = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=8))
            url = f"http://{random_str}{tld}/{brand}"
            
        data.append((url, "Phishing"))
        
    # Safe URLs
    for _ in range(1200):
        domain = random.choice(SAFE_DOMAINS)
        path = f"/{random.choice(['search', 'about', 'terms', 'dashboard', 'settings', 'profile'])}" if random.random() > 0.4 else ""
        sub = "www." if random.random() > 0.3 else ""
        url = f"https://{sub}{domain}{path}"
        data.append((url, "Safe"))

    # Write to CSV
    csv_path = "datasets/synthetic_phishing_urls.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["url", "label"])
        writer.writerows(data)
    print(f"URL dataset generated successfully with {len(data)} records at {csv_path}.")

if __name__ == "__main__":
    generate_text_dataset()
    generate_url_dataset()
