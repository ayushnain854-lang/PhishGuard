import os
import pickle
import numpy as np
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Import features extraction functions
from features import extract_text_features, extract_url_features

# Download necessary NLTK resources
def download_nltk_resources():
    print("Checking and downloading NLTK datasets...")
    for resource in ['punkt', 'punkt_tab', 'stopwords', 'wordnet']:
        try:
            # We can download them directly to be safe
            nltk.download(resource, quiet=True)
        except Exception as e:
            print(f"Error downloading {resource}: {e}")
    print("NLTK datasets ready.")

download_nltk_resources()

# Initialize text preprocessor
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    # Lowercase & Tokenize
    tokens = word_tokenize(text.lower())
    # Remove punctuation, stop words, and lemmatize
    cleaned = []
    for token in tokens:
        if token.isalnum() and token not in stop_words:
            cleaned.append(lemmatizer.lemmatize(token))
    return " ".join(cleaned)

def train_message_model():
    print("\n--- Training Message Classifier ---")
    dataset_path = "datasets/synthetic_phishing_emails.csv"
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Please run dataset_generator.py first.")
        return

    df = pd.read_csv(dataset_path)
    print(f"Loaded {len(df)} text samples.")

    # 1. Preprocess text contents
    print("Preprocessing text...")
    df['processed_text'] = df['text'].apply(preprocess_text)

    # 2. Extract numerical features
    print("Extracting handcrafted numerical features...")
    numerical_feats = []
    for t in df['text']:
        feats = extract_text_features(t)
        numerical_feats.append(list(feats.values()))
    
    numerical_feats = np.array(numerical_feats)

    # 3. Fit TF-IDF Vectorizer
    print("Vectorizing text via TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=1000)
    tfidf_matrix = vectorizer.fit_transform(df['processed_text']).toarray()

    # 4. Combine TF-IDF features with handcrafted features
    X = np.hstack((tfidf_matrix, numerical_feats))
    y = df['label'].map({"Safe": 0, "Phishing": 1}).values

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Train Random Forest Classifier
    print("Fitting Random Forest Model...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Message Classifier Test Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))

    # Save vectorizer and model
    model_data = {
        "model": clf,
        "vectorizer": vectorizer,
        "feature_keys": list(extract_text_features("").keys())
    }
    
    with open("ml_model/message_classifier_model.pkl", "wb") as f:
        pickle.dump(model_data, f)
    print("Saved message_classifier_model.pkl")


def train_url_model():
    print("\n--- Training URL Classifier ---")
    dataset_path = "datasets/synthetic_phishing_urls.csv"
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Please run dataset_generator.py first.")
        return

    df = pd.read_csv(dataset_path)
    print(f"Loaded {len(df)} URL samples.")

    # 1. Extract numerical URL features
    print("Extracting handcrafted URL features...")
    numerical_feats = []
    for url in df['url']:
        feats = extract_url_features(url)
        numerical_feats.append(list(feats.values()))
    
    X = np.array(numerical_feats)
    y = df['label'].map({"Safe": 0, "Phishing": 1}).values

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Train Random Forest Classifier
    print("Fitting Random Forest Model...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"URL Classifier Test Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))

    # Save model
    model_data = {
        "model": clf,
        "feature_keys": list(extract_url_features("").keys())
    }
    
    with open("ml_model/url_classifier_model.pkl", "wb") as f:
        pickle.dump(model_data, f)
    print("Saved url_classifier_model.pkl")

if __name__ == "__main__":
    train_message_model()
    train_url_model()
