# PhishGuard AI – Intelligent Real-Time Phishing Detection Platform

PhishGuard AI is a production-grade, commercial-quality cybersecurity platform designed to intercept, analyze, and explain phishing threats across emails, SMS texts, WhatsApp messages, URLs, and screenshots in real-time. 

Inspired by dashboards like Microsoft Defender and CrowdStrike Falcon, the system combines Natural Language Processing (NLP), Machine Learning, optical character recognition (OCR), and Explainable AI (XAI) with a Manifest V3 browser extension.

---

## Key Core Features

1. **Dashboard Console**: Glassmorphic, dark-mode administrative center tracking daily threats, security score metrics, recent scan history log lists, and achievement badges.
2. **Linguistic Message Scanner**: Text analyzer checks pasted emails and messages for urgent triggers, OTP demands, and money signals.
3. **URL Safety Analyzer**: URL scanner check checking TLD risk levels, IP inclusions, and subdomains.
4. **Brand Impersonation Detector**: Native Levenshtein edit distance logic to flag lookalike typo-squats mimicking domains (e.g. `goog1e.com` vs `google.com`).
5. **Screenshot Character Scanner (OCR)**: Extracts character textures from screenshots and feeds them to the ML classifiers, featuring fallback scripts for local execution compatibility.
6. **AI Cyber Assistant Chatbot**: Custom regex NLP intent model providing security audits, incident recovery checklists, and general guides.
7. **Chrome Extension (Manifest V3)**: Passive URL check updates badge states, context menus scan highlighted text, and content scripts inject action shields directly into Gmail/Outlook.
8. **Explainable AI (XAI)**: Scanners never just return "Phishing" — they list structural reasons and recovery recommendations.

---

## Technology Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Chart.js, Lucide Icons, Axios, React Router.
* **Backend**: Python, Flask, Flask-CORS, PyJWT, SQLite.
* **Machine Learning**: Scikit-Learn, Pandas, NumPy, NLTK, Pillow.
* **OCR**: EasyOCR / PyTesseract.
* **Browser Extension**: Chrome Manifest V3 (Javascript).

---

## Directory Structure

```
phishguard-ai/
├── backend/                  # Flask REST API and DB handlers
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── brand_impersonation.py
│   ├── ocr_engine.py
│   └── chatbot.py
├── frontend/                 # React.js Vite Frontend
│   ├── src/
│   │   ├── components/       # Sidebar, Navbar, StatCard, SecurityBadge
│   │   ├── pages/            # Dashboard, Scanners, Chatbot, History, Settings
│   │   ├── context/          # AuthSessionContext
│   │   └── utils/            # Axios API wrappers
│   ├── tailwind.config.js
│   └── index.html
├── browser_extension/        # Manifest V3 Chrome Extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── background.js
├── ml_model/                 # ML Feature Eng and training
│   ├── dataset_generator.py
│   ├── train.py
│   └── features.py
├── datasets/                 # Training CSVs
├── docs/                     # Architecture & API details
├── requirements.txt          # Python dependencies
└── README.md
```

---

## Quick Installation & Setup

### 1. Python Backend Setup
Create a virtual environment and install the required modules:
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows

# Install packages
pip install -r requirements.txt
```

### 2. Generate Dataset & Train ML Models
Train the Random Forest classifiers to generate the serialized picklers:
```bash
# Generate synthetic email/URL datasets
python ml_model/dataset_generator.py

# Download NLTK resources and train classifiers
python ml_model/train.py
```
*Note: This will output `message_classifier_model.pkl` and `url_classifier_model.pkl` in `ml_model/`.*

### 3. Spin Up Backend server
Launch the Flask development server:
```bash
python backend/app.py
```
*The server will initialize `phishguard.db` and start listening on `http://localhost:5000`.*

### 4. Setup React Frontend Dashboard
Install NPM packages and run the Vite compiler:
```bash
cd frontend
npm install
npm run dev
```
*The React app will open on `http://localhost:5173`.*

### 5. Install Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top-right).
3. Click **Load unpacked** (top-left) and select the `/browser_extension` folder.
4. The extension icon will appear in the toolbar. Shield active!
