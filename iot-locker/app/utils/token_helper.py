from flask_jwt_extended import get_jwt_identity
from app.models.user_model import UserModel

def get_current_user():
    """Get the current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        if user_id:
            return UserModel.query.get(int(user_id))
    except Exception:
        pass
    return None

def get_current_user_role():
    """Get the current user role from JWT token"""
    user = get_current_user()
    return user.role.value if user else 'user'

def get_current_username():
    """Get the current username from JWT token"""
    user = get_current_user()
    return user.username if user else 'unknown'

def is_admin():
    """Check if the current user is admin"""
    return get_current_user_role() == 'admin'