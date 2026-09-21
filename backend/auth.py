import os
import hmac
import hashlib
import json
import base64
import time
from typing import Optional, Dict, Any

# Local secret key for offline JWT-like token generation
SECRET_KEY = "ramaswami_peta_water_drainage_local_secret_key_csp_2026"
TOKEN_EXPIRATION_SECONDS = 86400 * 7 # 7 days local session

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """
    Hashes password using PBKDF2-HMAC-SHA256 with salt.
    Guaranteed to run offline on any Python environment without binary dependencies.
    """
    if not salt:
        salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{key.hex()}"

def verify_password(stored_password_hash: str, provided_password: str) -> bool:
    """
    Verifies a provided password against the stored salt:hash string.
    """
    try:
        salt, stored_hash = stored_password_hash.split(":")
        computed_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(stored_hash, computed_hash)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any]) -> str:
    """
    Creates an offline cryptographic token (HMAC-SHA256 signed JSON).
    """
    payload = data.copy()
    payload["exp"] = int(time.time()) + TOKEN_EXPIRATION_SECONDS
    payload["iat"] = int(time.time())
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{header_b64}.{payload_b64}.{signature}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies and decodes an offline cryptographic token.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature = parts
        
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        # Add padding back if necessary
        payload_json = base64.urlsafe_b64decode(payload_b64 + "==").decode()
        payload = json.loads(payload_json)
        
        # Check expiration
        if payload.get("exp", 0) < int(time.time()):
            return None
            
        return payload
    except Exception:
        return None
