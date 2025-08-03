from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify

def role_required(required_role):
    """
    Decorator để kiểm tra role của người dùng
    required_role: role cần thiết để truy cập (admin/user)
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            
            if not user_role or (required_role == "admin" and user_role != "admin"):
                return jsonify({"error": "Permission denied: Admin role required"}), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper
