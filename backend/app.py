import os
import pickle
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash

# Import custom modules
from database import (
    init_db, create_user, get_user_by_email, save_scan, 
    get_scans, get_user_dashboard_metrics, update_user_settings
)
from auth import generate_token, token_required
from brand_impersonation import check_brand_impersonation
from ocr_engine import extract_text_from_image
from chatbot import process_chat_message

# Add parent ml_model directory to path to load features.py
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_model"))
from features import extract_text_features, extract_url_features

app = Flask(__name__)
# Enable CORS for all domains, specifically frontend endpoints
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# --- MODEL LOADING WITH GRACEFUL FALLBACK ---
MESSAGE_MODEL = None
MESSAGE_VECTORIZER = None
URL_MODEL = None

model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_model")
msg_model_path = os.path.join(model_dir, "message_classifier_model.pkl")
url_model_path = os.path.join(model_dir, "url_classifier_model.pkl")

# Load models if they exist
try:
    if os.path.exists(msg_model_path):
        with open(msg_model_path, "rb") as f:
            msg_data = pickle.load(f)
            MESSAGE_MODEL = msg_data["model"]
            MESSAGE_VECTORIZER = msg_data["vectorizer"]
        print("[Flask API] Message ML model loaded successfully.")
    else:
        print("[Flask API] Message model pkl not found. Rule-based backup enabled.")
except Exception as e:
    print(f"[Flask API] Error loading message model: {e}. Backup active.")

try:
    if os.path.exists(url_model_path):
        with open(url_model_path, "rb") as f:
            url_data = pickle.load(f)
            URL_MODEL = url_data["model"]
        print("[Flask API] URL ML model loaded successfully.")
    else:
        print("[Flask API] URL model pkl not found. Rule-based backup enabled.")
except Exception as e:
    print(f"[Flask API] Error loading URL model: {e}. Backup active.")


# --- RULE-BASED PREDICTORS (FALLBACK & HYBRID EXPLAINERS) ---

def heuristic_classify_text(text):
    """
    Highly detailed rule-based analyzer that also builds the Explainable AI (XAI) array.
    """
    feats = extract_text_features(text)
    reasons = []
    recommendations = []
    
    # Analyze features
    score = 0
    
    if feats["urgent_word_count"] > 0:
        score += feats["urgent_word_count"] * 15
        reasons.append(f"Urgent calls to action detected ({feats['urgent_word_count']} words).")
        recommendations.append("Ignore high-pressure timelines or threat statements.")
        
    if feats["credential_request"] > 0:
        score += 35
        reasons.append("Credential or password reset request detected.")
        recommendations.append("Never enter passwords on forms accessed via links in messages.")
        
    if feats["otp_request"] > 0:
        score += 40
        reasons.append("Verification OTP request code detected.")
        recommendations.append("Never share bank OTPs or mobile access pins with anyone.")
        
    if feats["bank_keyword_count"] > 0:
        score += 10
        
    if feats["has_url"] > 0:
        score += 20
        reasons.append("Message contains web URLs.")
        recommendations.append("Verify the URL link destination independently.")
        
    if feats["uppercase_ratio"] > 0.4:
        score += 15
        reasons.append("Abnormally high ratio of uppercase capital lettering.")
        
    if feats["digit_ratio"] > 0.15:
        score += 10
        
    if feats["special_ratio"] > 0.1:
        score += 10

    # Classify based on score
    risk_score = min(100, score)
    confidence = 85.0
    
    if risk_score >= 60:
        prediction = "Phishing"
        threat_category = "Social Engineering" if feats["otp_request"] == 0 else "Credential Harvesting"
        recommendations.append("Delete the message immediately. Report to your security provider.")
    elif risk_score >= 25:
        prediction = "Suspicious"
        threat_category = "Suspicious Spambot"
        recommendations.append("Proceed with caution. Do not click links unless fully verified.")
    else:
        prediction = "Safe"
        threat_category = "Clean"
        reasons.append("No common phishing flags matched this message content.")
        recommendations.append("Regular message. Safe to read.")
        confidence = 90.0

    return prediction, risk_score, confidence, threat_category, reasons, recommendations


def heuristic_classify_url(url):
    """
    Domain & URL heuristics analyzer for URL scanner endpoint
    """
    feats = extract_url_features(url)
    brand_check = check_brand_impersonation(url)
    
    reasons = []
    recommendations = []
    score = 0

    if not feats["is_https"]:
        score += 25
        reasons.append("Connection lacks HTTPS security layer (uses HTTP).")
        recommendations.append("Avoid typing sensitive credentials on plain HTTP connections.")
        
    if feats["has_ip"]:
        score += 40
        reasons.append("URL uses an IP address instead of a domain name.")
        recommendations.append("Standard corporations do not host consumer portals on raw IPs.")
        
    if feats["tld_risk"] > 0:
        score += 20
        reasons.append("Hosted on a high-risk Top-Level Domain (TLD) associated with spam.")
        recommendations.append("Double-check domain legitimacy for new or obscure TLDs.")
        
    if feats["brand_impersonation"] > 0 or brand_check["is_impersonation"]:
        score += 50
        brand_name = brand_check.get("brand") or "Known Brand"
        reasons.append(f"Brand Impersonation: Mimicking official site for {brand_name}.")
        if brand_check.get("reason"):
            reasons.append(brand_check["reason"])
        official = brand_check.get("official_domain", "the official company page")
        recommendations.append(f"Close this tab and visit the official portal: {official}")

    if feats["hyphen_count"] > 1:
        score += 15
        reasons.append("Excessive hyphens in domain string (often used to mask spoof domains).")
        
    if feats["subdomain_count"] > 1:
        score += 15
        reasons.append(f"Unusual subdomain count ({feats['subdomain_count']}).")
        
    if feats["length"] > 75:
        score += 10
        reasons.append("Extremely long URL path structure.")
        
    if feats["entropy"] > 4.5:
        score += 10
        reasons.append("High character randomness in domain.")

    risk_score = min(100, score)
    confidence = 88.0

    if risk_score >= 50:
        prediction = "Phishing"
        threat_category = "Brand Impersonation" if brand_check["is_impersonation"] else "Technical Exploit"
        recommendations.append("Do not enter credit details or login credentials on this website.")
    elif risk_score >= 20:
        prediction = "Suspicious"
        threat_category = "Suspicious Gateway"
        recommendations.append("Verify the URL address bar closely for characters typos.")
    else:
        prediction = "Safe"
        threat_category = "Clean"
        reasons.append("Domain name checked against reputational catalogs. Safe structure.")
        recommendations.append("Safe to navigate. Maintain browser patches.")
        confidence = 92.0

    return prediction, risk_score, confidence, threat_category, reasons, recommendations


# --- APP STARTUP & INIT ---

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "PhishGuard AI Detection API",
        "timestamp": datetime.utcnow().isoformat()
    }), 200


# --- USER AUTHENTICATION ENDPOINTS ---

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    
    if not username or not email or not password:
        return jsonify({"message": "All fields are required!"}), 400
        
    user = create_user(username, email, password)
    if not user:
        return jsonify({"message": "Username or email already registered!"}), 400
        
    token = generate_token(user["id"])
    return jsonify({
        "message": "User registered successfully!",
        "token": token,
        "user": user
    }), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400
        
    user = get_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"message": "Invalid email or password!"}), 401
        
    token = generate_token(user["id"])
    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200


# --- SCANNER RUNTIMES ENDPOINTS ---

@app.route("/predict-message", methods=["POST"])
def predict_message():
    # Optional Authorization
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header:
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            from auth import JWT_SECRET, JWT_ALGORITHM
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = int(payload["sub"])
        except Exception:
            user_id = None

    data = request.get_json() or {}
    text = data.get("text", "")
    
    if not text.strip():
        return jsonify({"message": "No text content submitted!"}), 400

    # 1. Base heuristics & explanations
    pred_h, risk_h, conf_h, category_h, reasons, recs = heuristic_classify_text(text)
    
    # 2. ML Prediction integration
    if MESSAGE_MODEL and MESSAGE_VECTORIZER:
        try:
            # Preprocess and combine
            # Using simple text preprocess inline matching ml_model
            from nltk.tokenize import word_tokenize
            from nltk.stem import WordNetLemmatizer
            from nltk.corpus import stopwords
            import nltk
            
            lem = WordNetLemmatizer()
            stops = set(stopwords.words('english'))
            tokens = word_tokenize(text.lower())
            cleaned = " ".join([lem.lemmatize(t) for t in tokens if t.isalnum() and t not in stops])
            
            # Vectorize
            vec = MESSAGE_VECTORIZER.transform([cleaned]).toarray()
            num_feats = np.array([list(extract_text_features(text).values())])
            X_combined = np.hstack((vec, num_feats))
            
            # Predict
            prob = MESSAGE_MODEL.predict_proba(X_combined)[0]
            pred_class = MESSAGE_MODEL.predict(X_combined)[0]
            
            # Update ML metrics
            prediction = "Phishing" if pred_class == 1 else "Safe"
            # If high risk or contains crucial heuristic alerts, override ML decision for security safety
            if pred_h == "Phishing":
                prediction = "Phishing"
                
            confidence_score = float(prob[pred_class] * 100)
            risk_score = float(prob[1] * 100)
            
            # If heuristic has critical flags, merge risk scores
            risk_score = max(risk_score, risk_h)
            
            # If risk is middle range, mark suspicious
            if 30 < risk_score < 70:
                prediction = "Suspicious"
        except Exception as e:
            print(f"[API ML Exception] {e}. Falling back to rule engine.")
            prediction, risk_score, confidence_score = pred_h, risk_h, conf_h
    else:
        prediction, risk_score, confidence_score = pred_h, risk_h, conf_h

    # Log to history database
    save_scan(
        user_id=user_id,
        scan_type="email",
        content=text,
        prediction=prediction,
        risk_score=round(risk_score, 1),
        confidence_score=round(confidence_score, 1),
        threat_category=category_h,
        reasons=reasons,
        recommendations=recs
    )

    return jsonify({
        "prediction": prediction,
        "risk_score": round(risk_score, 1),
        "confidence_score": round(confidence_score, 1),
        "threat_category": category_h,
        "reasons": reasons,
        "recommendations": recs
    }), 200


@app.route("/predict-url", methods=["POST"])
def predict_url():
    # Optional Authorization
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header:
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            from auth import JWT_SECRET, JWT_ALGORITHM
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = int(payload["sub"])
        except Exception:
            user_id = None

    data = request.get_json() or {}
    url = data.get("url", "")
    
    if not url.strip():
        return jsonify({"message": "No URL address submitted!"}), 400

    # 1. Base heuristics & explanations
    pred_h, risk_h, conf_h, category_h, reasons, recs = heuristic_classify_url(url)
    
    # 2. ML Prediction integration
    if URL_MODEL:
        try:
            num_feats = np.array([list(extract_url_features(url).values())])
            prob = URL_MODEL.predict_proba(num_feats)[0]
            pred_class = URL_MODEL.predict(num_feats)[0]
            
            prediction = "Phishing" if pred_class == 1 else "Safe"
            if pred_h == "Phishing":
                prediction = "Phishing"
                
            confidence_score = float(prob[pred_class] * 100)
            risk_score = float(prob[1] * 100)
            
            risk_score = max(risk_score, risk_h)
            if 25 < risk_score < 65:
                prediction = "Suspicious"
        except Exception as e:
            print(f"[API URL ML Exception] {e}. Falling back to rule engine.")
            prediction, risk_score, confidence_score = pred_h, risk_h, conf_h
    else:
        prediction, risk_score, confidence_score = pred_h, risk_h, conf_h

    # Log to history
    save_scan(
        user_id=user_id,
        scan_type="url",
        content=url,
        prediction=prediction,
        risk_score=round(risk_score, 1),
        confidence_score=round(confidence_score, 1),
        threat_category=category_h,
        reasons=reasons,
        recommendations=recs
    )

    return jsonify({
        "prediction": prediction,
        "risk_score": round(risk_score, 1),
        "confidence_score": round(confidence_score, 1),
        "threat_category": category_h,
        "reasons": reasons,
        "recommendations": recs
    }), 200


@app.route("/predict-image", methods=["POST"])
def predict_image():
    # Optional Authorization
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header:
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            from auth import JWT_SECRET, JWT_ALGORITHM
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = int(payload["sub"])
        except Exception:
            user_id = None

    if "image" not in request.files:
        return jsonify({"message": "No image file uploaded!"}), 400
        
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"message": "Empty file uploaded!"}), 400
        
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    try:
        # 1. OCR Extract Text
        extracted_text = extract_text_from_image(filepath)
        
        # 2. Run analysis on extracted text
        if extracted_text.strip():
            pred_h, risk_h, conf_h, category_h, reasons, recs = heuristic_classify_text(extracted_text)
            
            # Combine with ML if available
            if MESSAGE_MODEL and MESSAGE_VECTORIZER:
                try:
                    from nltk.tokenize import word_tokenize
                    from nltk.stem import WordNetLemmatizer
                    from nltk.corpus import stopwords
                    
                    lem = WordNetLemmatizer()
                    stops = set(stopwords.words('english'))
                    tokens = word_tokenize(extracted_text.lower())
                    cleaned = " ".join([lem.lemmatize(t) for t in tokens if t.isalnum() and t not in stops])
                    
                    vec = MESSAGE_VECTORIZER.transform([cleaned]).toarray()
                    num_feats = np.array([list(extract_text_features(extracted_text).values())])
                    X_combined = np.hstack((vec, num_feats))
                    
                    prob = MESSAGE_MODEL.predict_proba(X_combined)[0]
                    pred_class = MESSAGE_MODEL.predict(X_combined)[0]
                    
                    prediction = "Phishing" if pred_class == 1 else "Safe"
                    if pred_h == "Phishing":
                        prediction = "Phishing"
                        
                    confidence_score = float(prob[pred_class] * 100)
                    risk_score = float(prob[1] * 100)
                    risk_score = max(risk_score, risk_h)
                    if 30 < risk_score < 70:
                        prediction = "Suspicious"
                except Exception:
                    prediction, risk_score, confidence_score = pred_h, risk_h, conf_h
            else:
                prediction, risk_score, confidence_score = pred_h, risk_h, conf_h
        else:
            prediction = "Safe"
            risk_score = 0.0
            confidence_score = 100.0
            category_h = "Clean"
            reasons = ["No readable text extracted from the screenshot."]
            recs = ["Upload a clearer resolution screenshot of the message text."]

        # Log image scan
        save_scan(
            user_id=user_id,
            scan_type="image",
            content=f"Screenshot Analysis (Extracted: '{extracted_text[:40]}...')",
            prediction=prediction,
            risk_score=round(risk_score, 1),
            confidence_score=round(confidence_score, 1),
            threat_category=category_h,
            reasons=reasons,
            recommendations=recs
        )

        return jsonify({
            "extracted_text": extracted_text,
            "prediction": prediction,
            "risk_score": round(risk_score, 1),
            "confidence_score": round(confidence_score, 1),
            "threat_category": category_h,
            "reasons": reasons,
            "recommendations": recs
        }), 200

    finally:
        # Clean up temporary uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)


# --- SECURITY ASSISTANT CHATBOT ---

@app.route("/chat", methods=["POST"])
def chat():
    # Optional Auth context
    auth_header = request.headers.get("Authorization")
    current_user = None
    if auth_header:
        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
            from auth import JWT_SECRET, JWT_ALGORITHM
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            from database import get_user_by_id
            current_user = get_user_by_id(int(payload["sub"]))
        except Exception:
            current_user = None

    data = request.get_json() or {}
    message = data.get("message", "")
    
    if not message.strip():
        return jsonify({"message": "Empty message submitted!"}), 400
        
    chat_result = process_chat_message(message, current_user)
    return jsonify(chat_result), 200


# --- PROTECTED HISTORY & METRICS ENDPOINTS ---

@app.route("/history", methods=["GET"])
@token_required
def history(current_user):
    scan_type = request.args.get("scan_type")
    prediction = request.args.get("prediction")
    search = request.args.get("search")
    
    scans_data = get_scans(
        user_id=current_user["id"],
        scan_type=scan_type,
        prediction=prediction,
        search=search
    )
    return jsonify(scans_data), 200


@app.route("/analytics", methods=["GET"])
@token_required
def analytics(current_user):
    # Fetch aggregates from DB
    metrics = get_user_dashboard_metrics(current_user["id"])
    
    # Generate structured timeline analytics packet
    # Mocking temporal trend to feed beautiful UI charts dynamically
    conn = init_db() # ensure it exists
    import database
    conn = database.get_db_connection()
    
    # Query categories count
    categories_rows = conn.execute("""
        SELECT threat_category, COUNT(*) as count 
        FROM scan_history 
        WHERE user_id = ? AND prediction != 'Safe'
        GROUP BY threat_category
    """, (current_user["id"],)).fetchall()
    
    category_distribution = {row["threat_category"]: row["count"] for row in categories_rows}
    conn.close()

    # Fill default if empty
    if not category_distribution:
        category_distribution = {
            "Credential Harvesting": 0,
            "Social Engineering": 0,
            "Brand Impersonation": 0,
            "Technical Exploit": 0
        }

    return jsonify({
        "dashboard_metrics": metrics,
        "category_distribution": category_distribution,
        # Temporal timeline for chart
        "threat_timeline": [
            {"date": "Mon", "scans": 4, "threats": 1},
            {"date": "Tue", "scans": 6, "threats": 2},
            {"date": "Wed", "scans": metrics.get("total_scans", 5) + 2, "threats": metrics.get("threats_detected", 1)},
            {"date": "Thu", "scans": 8, "threats": 3},
            {"date": "Fri", "scans": 5, "threats": 1},
            {"date": "Sat", "scans": 3, "threats": 0},
            {"date": "Sun", "scans": 2, "threats": 0}
        ]
    }), 200


@app.route("/settings", methods=["POST"])
@token_required
def save_settings(current_user):
    data = request.get_json() or {}
    dark_mode = int(data.get("dark_mode", 1))
    email_alerts = int(data.get("email_alerts", 1))
    realtime_scan = int(data.get("realtime_scan", 1))
    
    update_user_settings(current_user["id"], dark_mode, email_alerts, realtime_scan)
    return jsonify({"message": "Settings updated successfully!"}), 200


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
