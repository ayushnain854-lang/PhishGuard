# PhishGuard AI - Architectural Overview

PhishGuard AI is structured under a **Clean Layered Architecture** with strict separations of concerns between the Machine Learning pipeline, the REST API Backend, the React Admin Frontend, and the Chrome Browser Extension.

---

## 1. Directory Blueprint & Layer Separation

The folder layout separates application domains to prevent cross-contamination of logic:

* **`/ml_model`**: Model specification and training. Outputs serialization assets.
* **`/backend`**: The gateway routing service. Interacts with the database, loads the ML picklers, runs character extraction (OCR), and houses custom regex intent matchers (chatbot).
* **`/frontend`**: User presentation and dashboard. Interacts with `/backend` using a standard Axios wrapper and holds routing layouts.
* **`/browser_extension`**: Chrome worker services. Interacts with DOM objects directly on visited webpages or mail portals, and dispatches data to `/backend`.

---

## 2. Machine Learning Pipeline Flow

The training and detection stages leverage a hybrid numeric-TFIDF Random Forest model to assure precision:

```
[Text Raw Dataset] 
       ↓
[NLTK Processing (Tokenize, Stopwords, WordNet Lemmatization)]
       ↓
[Vectorization (TF-IDF fit, max_features=1000)] → [TF-IDF Array]
                                                        ↓
[Numerical Feature Engineering (Urgency, OTPs, URLs)] → [Handcrafted Array]
                                                        ↓
                                                [Merged feature matrix X]
                                                        ↓
                                            [RandomForestClassifier (100 est)]
                                                        ↓
                                            [message_classifier_model.pkl]
```

* **Text Feature Engineering**: Handcrafted indicators capture social engineering hooks (e.g. tracking "OTP", "verification PIN", uppercase capitalize percentages) which simple TF-IDF matrices sometimes miss.
* **URL Feature Engineering**: Domain-level parsing extracts entropy ratios, IP address inclusions, hyphen and subdomain metrics, and risky TLD extensions (`.xyz`, `.top`).
* **Brand Impersonation Engine**: Uses a Native Levenshtein edit distance calculator and substring keyword search to compute typographical match percentages against whitelisted corporate domains, immediately raising the risk rating on Look-Alike domains.

---

## 3. Flask Backend Service Architecture

The Flask backend follows a modular helper script structure:

* **`app.py`**: Declares CORS bindings, uploads configurations, and exposes the HTTP endpoint mappings (`/signup`, `/predict-message`, etc.).
* **`auth.py`**: Intercepts requests destined for protected scopes using a `@token_required` decorator, validating incoming JWT signatures.
* **`database.py`**: Encapsulates SQLite3 queries inside contexts (`with sqlite3.connect`), handles password cryptographies, and contains triggers that automatically degrade or upgrade a user's Security Score based on scan predictions.
* **`ocr_engine.py`**: Attempts dynamic imports of `easyocr` or `pytesseract` to parse images, fallback-simulating typical character text blocks if host compiler tools are absent to prevent evaluation crashes.
* **`chatbot.py`**: Formulates cybersecurity response structures using regular expression intent selectors.

---

## 4. Frontend UI State Management

The Vite React project is managed via centralized contexts and styling variables:

* **`AuthContext.jsx`**: Preserves user profiles, sets localStorage tokens, and manages state loaders during session handshake transitions.
* **`api.js`**: Reusable Axios instance with request interceptors that automatically attach the stored token header.
* **`index.css` & `tailwind.config.js`**: Configure glassmorphic shadows (`shadow-cyan-glow`) and dark cyber-security background gradients.

---

## 5. Chrome Extension Manifest V3 Pipelines

The browser extension operates across three contexts:

1. **`popup.js`**: Drives the popup dropdown, querying the active tab URL to submit to the URL API, updating the HTML risk bar.
2. **`background.js`**: Registers context menus (`chrome.contextMenus`) to scan highlighted texts, listens for tab updates to passively run checks, and alerts tab content layers.
3. **`content.js`**: Listens for background signals to inject warning overlays, and polls document nodes on portals like Gmail or Outlook to inject scan actions.
