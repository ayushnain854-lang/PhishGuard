# PhishGuard AI - API Documentation

The PhishGuard AI backend is built as a Flask REST API running on `http://localhost:5000` by default.

---

## 1. Authentication Endpoints

### Enrolls a New Sentinel Agent
* **Endpoint**: `POST /signup`
* **Authentication**: None
* **Request Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "agent_maverick",
  "email": "maverick@phishguard.ai",
  "password": "SecurePassword123"
}
```
* **Success Response (201 Created)**:
```json
{
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "agent_maverick",
    "email": "maverick@phishguard.ai"
  }
}
```

---

### Authenticates an Agent
* **Endpoint**: `POST /login`
* **Authentication**: None
* **Request Body**:
```json
{
  "email": "maverick@phishguard.ai",
  "password": "SecurePassword123"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "agent_maverick",
    "email": "maverick@phishguard.ai"
  }
}
```

---

## 2. Threat Detection Core Endpoints

### Analyze pasted message / email content
* **Endpoint**: `POST /predict-message`
* **Authentication**: Optional (Include JWT in headers to log scan to history dashboard)
* **Request Headers**: `Authorization: Bearer <token>` (optional)
* **Request Body**:
```json
{
  "text": "URGENT: Your bank account is locked. Verify now at http://sbi-login-access.xyz/login"
}
```
* **Success Response (200 OK)**:
```json
{
  "prediction": "Phishing",
  "risk_score": 95.0,
  "confidence_score": 98.4,
  "threat_category": "Credential Harvesting",
  "reasons": [
    "Urgent calls to action detected (1 words).",
    "Credential or password reset request detected.",
    "Verification OTP request code detected.",
    "Message contains web URLs."
  ],
  "recommendations": [
    "Ignore high-pressure timelines or threat statements.",
    "Never enter passwords on forms accessed via links in messages.",
    "Delete the message immediately. Report to your security provider."
  ]
}
```

---

### Analyze external URL hyperlinks
* **Endpoint**: `POST /predict-url`
* **Authentication**: Optional (Include JWT to save result)
* **Request Body**:
```json
{
  "url": "https://sbi-login-access-verification.xyz/login"
}
```
* **Success Response (200 OK)**:
```json
{
  "prediction": "Phishing",
  "risk_score": 90.0,
  "confidence_score": 88.0,
  "threat_category": "Brand Impersonation",
  "reasons": [
    "Connection lacks HTTPS security layer (uses HTTP).",
    "Hosted on a high-risk Top-Level Domain (TLD) associated with spam.",
    "Brand Impersonation: Mimicking official site for State Bank of India (SBI)."
  ],
  "recommendations": [
    "Do not enter credit details or login credentials on this website.",
    "Close this tab and visit the official portal: onlinesbi.sbi"
  ]
}
```

---

### Run OCR scan on message screenshot uploads
* **Endpoint**: `POST /predict-image`
* **Authentication**: Optional
* **Request Headers**: `Content-Type: multipart/form-data`
* **Request Body**: Form-data body containing a key `"image"` holding the file binary.
* **Success Response (200 OK)**:
```json
{
  "extracted_text": "URGENT: Your SBI netbanking account is suspended. Verify OTP here immediately...",
  "prediction": "Phishing",
  "risk_score": 95.0,
  "confidence_score": 90.0,
  "threat_category": "Credential Harvesting",
  "reasons": [
    "Urgent calls to action detected.",
    "Message contains web URLs."
  ],
  "recommendations": [
    "Ignore high-pressure timelines.",
    "Verify the URL independently."
  ]
}
```

---

## 3. Cyber Assistant Chatbot Endpoint

### Communicate with the AI Cyber Assistant
* **Endpoint**: `POST /chat`
* **Authentication**: Optional
* **Request Body**:
```json
{
  "message": "I clicked on a link, what should I do?"
}
```
* **Success Response (200 OK)**:
```json
{
  "response": "### 🚨 Immediate Response Action Plan\n\n1. **Change Passwords**...\n2. **Enable Multi-Factor Authentication**...",
  "intent": "incident_response",
  "actions": ["Change Passwords", "Enable MFA", "Contact Bank"]
}
```

---

## 4. Protected History & Analytics Endpoints

*Requires Request Header:* `Authorization: Bearer <token>`

### Fetch past scanning logs
* **Endpoint**: `GET /history`
* **Query Parameters**:
  * `scan_type` (optional): `email` | `url` | `image`
  * `prediction` (optional): `Safe` | `Suspicious` | `Phishing`
  * `search` (optional): search text string
* **Success Response (200 OK)**:
```json
[
  {
    "id": 5,
    "user_id": 1,
    "scan_type": "email",
    "content": "URGENT: Your bank account is locked...",
    "prediction": "Phishing",
    "risk_score": 95.0,
    "confidence_score": 98.0,
    "threat_category": "Credential Harvesting",
    "reasons": ["Urgent words", "URLs found"],
    "recommendations": ["Ignore timelines", "Verify links"],
    "created_at": "2026-08-18T23:18:00"
  }
]
```

---

### Fetch dashboard metrics and timeline trends
* **Endpoint**: `GET /analytics`
* **Success Response (200 OK)**:
```json
{
  "dashboard_metrics": {
    "security_score": 88,
    "threats_avoided": 4,
    "messages_scanned": 12,
    "websites_checked": 6,
    "total_scans": 18,
    "threats_detected": 4,
    "suspicious_detected": 2,
    "safe_scans": 12,
    "today_scans": 3,
    "avg_risk_score": 38.5,
    "settings": {
      "dark_mode": 1,
      "email_alerts": 1,
      "realtime_scan": 1
    }
  },
  "category_distribution": {
    "Credential Harvesting": 2,
    "Social Engineering": 1,
    "Brand Impersonation": 1,
    "Technical Exploit": 0
  },
  "threat_timeline": [
    {"date": "Mon", "scans": 4, "threats": 1},
    {"date": "Tue", "scans": 6, "threats": 2},
    {"date": "Wed", "scans": 5, "threats": 1}
  ]
}
```

---

### Update Agent Preferences Settings
* **Endpoint**: `POST /settings`
* **Request Body**:
```json
{
  "dark_mode": 1,
  "email_alerts": 0,
  "realtime_scan": 1
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Settings updated successfully!"
}
```
