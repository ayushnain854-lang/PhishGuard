import os
import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Set SQLite database path
DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "phishguard.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # 2. Scan History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        scan_type TEXT NOT NULL, -- 'email', 'sms', 'url', 'image'
        content TEXT NOT NULL,
        prediction TEXT NOT NULL, -- 'Safe', 'Suspicious', 'Phishing'
        risk_score REAL NOT NULL,
        confidence_score REAL NOT NULL,
        threat_category TEXT NOT NULL,
        reasons TEXT NOT NULL, -- JSON string list of explanations
        recommendations TEXT NOT NULL, -- JSON string list of steps
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # 3. Security Metrics Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS security_metrics (
        user_id INTEGER PRIMARY KEY,
        security_score INTEGER DEFAULT 80,
        threats_avoided INTEGER DEFAULT 0,
        messages_scanned INTEGER DEFAULT 0,
        websites_checked INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # 4. Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER PRIMARY KEY,
        dark_mode INTEGER DEFAULT 1, -- 1=True, 0=False
        email_alerts INTEGER DEFAULT 1,
        realtime_scan INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

# --- DATABASE OPERATIONS ---

# User Auth Functions
def create_user(username, email, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = generate_password_hash(password)
    created_at = datetime.now().isoformat()
    
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, created_at)
        )
        user_id = cursor.lastrowid
        
        # Initialize default metrics and settings
        cursor.execute("INSERT INTO security_metrics (user_id) VALUES (?)", (user_id,))
        cursor.execute("INSERT INTO settings (user_id) VALUES (?)", (user_id,))
        
        conn.commit()
        return {"id": user_id, "username": username, "email": email}
    except sqlite3.IntegrityError as e:
        conn.rollback()
        return None
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

# Scan History Functions
def save_scan(user_id, scan_type, content, prediction, risk_score, confidence_score, threat_category, reasons, recommendations):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.now().isoformat()
    
    cursor.execute("""
        INSERT INTO scan_history 
        (user_id, scan_type, content, prediction, risk_score, confidence_score, threat_category, reasons, recommendations, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, scan_type, content, prediction, risk_score, confidence_score, 
        threat_category, json.dumps(reasons), json.dumps(recommendations), created_at
    ))
    
    # Update Security Metrics if user is logged in
    if user_id:
        # Update scan counters
        if scan_type in ['email', 'sms']:
            cursor.execute("UPDATE security_metrics SET messages_scanned = messages_scanned + 1 WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("UPDATE security_metrics SET websites_checked = websites_checked + 1 WHERE user_id = ?", (user_id,))
            
        # Update threats avoided if phishing
        if prediction == "Phishing":
            cursor.execute("UPDATE security_metrics SET threats_avoided = threats_avoided + 1 WHERE user_id = ?", (user_id,))
            # Phishing scans degrade score slightly (down to min 30) if user scans multiple threats
            cursor.execute("UPDATE security_metrics SET security_score = MAX(30, security_score - 2) WHERE user_id = ?", (user_id,))
        elif prediction == "Safe":
            # Safe scans raise security score slightly (up to max 100)
            cursor.execute("UPDATE security_metrics SET security_score = MIN(100, security_score + 1) WHERE user_id = ?", (user_id,))
            
    conn.commit()
    scan_id = cursor.lastrowid
    conn.close()
    return scan_id

def get_scans(user_id, scan_type=None, prediction=None, search=None, limit=100):
    conn = get_db_connection()
    query = "SELECT * FROM scan_history WHERE user_id = ?"
    params = [user_id]
    
    if scan_type:
        query += " AND scan_type = ?"
        params.append(scan_type)
        
    if prediction:
        query += " AND prediction = ?"
        params.append(prediction)
        
    if search:
        query += " AND content LIKE ?"
        params.append(f"%{search}%")
        
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    scans = []
    for r in rows:
        d = dict(r)
        d['reasons'] = json.loads(d['reasons'])
        d['recommendations'] = json.loads(d['recommendations'])
        scans.append(d)
    return scans

# Security Dashboard Metrics Functions
def get_user_dashboard_metrics(user_id):
    conn = get_db_connection()
    
    # Get direct metrics
    metric_row = conn.execute("SELECT * FROM security_metrics WHERE user_id = ?", (user_id,)).fetchone()
    settings_row = conn.execute("SELECT * FROM settings WHERE user_id = ?", (user_id,)).fetchone()
    
    if not metric_row:
        # fallback setup
        conn.execute("INSERT OR IGNORE INTO security_metrics (user_id) VALUES (?)", (user_id,))
        conn.execute("INSERT OR IGNORE INTO settings (user_id) VALUES (?)", (user_id,))
        conn.commit()
        metric_row = conn.execute("SELECT * FROM security_metrics WHERE user_id = ?", (user_id,)).fetchone()
        settings_row = conn.execute("SELECT * FROM settings WHERE user_id = ?", (user_id,)).fetchone()
        
    metrics = dict(metric_row) if metric_row else {"security_score": 80, "threats_avoided": 0, "messages_scanned": 0, "websites_checked": 0}
    settings_data = dict(settings_row) if settings_row else {"dark_mode": 1, "email_alerts": 1, "realtime_scan": 1}
    
    # Calculate some aggregated values
    total_scans = conn.execute("SELECT COUNT(*) FROM scan_history WHERE user_id = ?", (user_id,)).fetchone()[0]
    threats_count = conn.execute("SELECT COUNT(*) FROM scan_history WHERE user_id = ? AND prediction = 'Phishing'", (user_id,)).fetchone()[0]
    suspicious_count = conn.execute("SELECT COUNT(*) FROM scan_history WHERE user_id = ? AND prediction = 'Suspicious'", (user_id,)).fetchone()[0]
    safe_count = conn.execute("SELECT COUNT(*) FROM scan_history WHERE user_id = ? AND prediction = 'Safe'", (user_id,)).fetchone()[0]
    
    # Scans in last 24h
    today_scans = conn.execute(
        "SELECT COUNT(*) FROM scan_history WHERE user_id = ? AND datetime(created_at) >= datetime('now', '-1 day')", 
        (user_id,)
    ).fetchone()[0]

    # Calculate average risk score
    avg_risk = conn.execute("SELECT AVG(risk_score) FROM scan_history WHERE user_id = ?", (user_id,)).fetchone()[0]
    avg_risk = round(avg_risk, 1) if avg_risk is not None else 0.0

    conn.close()
    
    # Combine into a dashboard packet
    return {
        "security_score": metrics["security_score"],
        "threats_avoided": metrics["threats_avoided"],
        "messages_scanned": metrics["messages_scanned"],
        "websites_checked": metrics["websites_checked"],
        "total_scans": total_scans,
        "threats_detected": threats_count,
        "suspicious_detected": suspicious_count,
        "safe_scans": safe_count,
        "today_scans": today_scans,
        "avg_risk_score": avg_risk,
        "settings": settings_data
    }

# Update Settings
def update_user_settings(user_id, dark_mode, email_alerts, realtime_scan):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE settings 
        SET dark_mode = ?, email_alerts = ?, realtime_scan = ?
        WHERE user_id = ?
    """, (dark_mode, email_alerts, realtime_scan, user_id))
    conn.commit()
    conn.close()
    return True
