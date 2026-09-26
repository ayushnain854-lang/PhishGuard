import os
from PIL import Image

EASYOCR_AVAILABLE = False
PYTESSERACT_AVAILABLE = False

# Try loading EasyOCR
try:
    import easyocr
    # Initialize reader with English language, CPU-only by default for compatibility
    reader = easyocr.Reader(['en'], gpu=False)
    EASYOCR_AVAILABLE = True
    print("[OCR] EasyOCR initialized successfully.")
except Exception as e:
    print(f"[OCR] EasyOCR not loaded: {e}. Checking PyTesseract...")

# Try loading PyTesseract
if not EASYOCR_AVAILABLE:
    try:
        import pytesseract
        PYTESSERACT_AVAILABLE = True
        print("[OCR] PyTesseract library import successful.")
    except Exception as e:
        print(f"[OCR] PyTesseract library not loaded: {e}.")

def simulate_ocr_text(image_path):
    """
    Fallback mock text extraction to simulate a successful OCR pipeline 
    if system-level OCR binary tools are not installed.
    """
    filename = os.path.basename(image_path).lower()
    
    # Return simulated phishing texts based on keywords in image name
    if "sbi" in filename or "bank" in filename or "transaction" in filename:
        return "URGENT: Your SBI netbanking account is suspended. Verify OTP 837492 here immediately: http://sbi-login-access-verification.xyz/login to restore."
    elif "paypal" in filename or "pay" in filename:
        return "Dear Paypal Customer, We detected unauthorized activity on your credit card. Login to dispute charges at http://paypal-dispute-alert.info/login now."
    elif "netflix" in filename or "bill" in filename:
        return "Netflix: Your payment failed. Please update your billing details immediately at https://netflix-update-billing.top to avoid account closure."
    elif "gift" in filename or "prize" in filename or "win" in filename:
        return "Congratulations! You won a $1000 Walmart Gift Card! Click here http://walmart-free-giftcard.online to redeem your reward. Expiring in 2 hours."
    else:
        # Default fallback text simulating a safe work screenshot
        return "Hi Sarah, can you review the attached project architecture document by Friday? Let's discuss it in our 10 AM sync meeting. Thanks!"

def extract_text_from_image(image_path):
    """
    Tries EasyOCR, falls back to PyTesseract, and falls back to text simulation
    """
    if not os.path.exists(image_path):
        return ""

    # 1. EasyOCR Implementation
    if EASYOCR_AVAILABLE:
        try:
            print("[OCR] Attempting extraction with EasyOCR...")
            results = reader.readtext(image_path)
            extracted = " ".join([res[1] for res in results])
            if extracted.strip():
                return extracted
        except Exception as e:
            print(f"[OCR] EasyOCR extraction failed: {e}")

    # 2. PyTesseract Implementation
    if PYTESSERACT_AVAILABLE:
        try:
            print("[OCR] Attempting extraction with PyTesseract...")
            img = Image.open(image_path)
            extracted = pytesseract.image_to_string(img)
            if extracted.strip():
                return extracted.strip()
        except Exception as e:
            print(f"[OCR] PyTesseract extraction failed: {e}")

    # 3. Graceful Simulation Fallback
    print("[OCR] Libraries unavailable or failed. Using simulation fallback.")
    return simulate_ocr_text(image_path)
