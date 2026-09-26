import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

# Import database methods
from database import get_user_by_id

JWT_SECRET = "phishguard_secure_jwt_secret_key_2026_rf_xg"
JWT_ALGORITHM = "HS256"

def generate_token(user_id):
    """
    Generate JWT Token valid for 7 days
    """
    payload = {
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
        "sub": str(user_id)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    """
    Decorator to protect Flask endpoints
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            # Typically "Bearer <token>"
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            else:
                token = auth_header
                
        print(f"[AUTH DEBUG] Authorization header: {request.headers.get('Authorization')}")
        print(f"[AUTH DEBUG] Token parsed: {token}")
        
        if not token:
            print("[AUTH DEBUG] No token provided")
            return jsonify({"message": "Access token is missing!"}), 401
            
        try:
            # Decode token
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user_id = payload["sub"]
            current_user = get_user_by_id(current_user_id)
            
            if not current_user:
                print(f"[AUTH DEBUG] User not found for id: {current_user_id}")
                return jsonify({"message": "User not found or session invalid!"}), 401
                
        except jwt.ExpiredSignatureError as e:
            print(f"[AUTH DEBUG] ExpiredSignatureError: {e}")
            return jsonify({"message": "Session expired! Please log in again."}), 401
        except jwt.InvalidTokenError as e:
            print(f"[AUTH DEBUG] InvalidTokenError: {e}")
            return jsonify({"message": "Invalid access token!"}), 401
        except Exception as e:
            print(f"[AUTH DEBUG] General token error: {e}")
            return jsonify({"message": "Error decoding token"}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated
