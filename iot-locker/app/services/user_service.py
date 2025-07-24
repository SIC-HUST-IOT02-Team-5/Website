from app.extensions import db
from app.models.user_model import User
from passlib.hash import pbkdf2_sha256

def create_user(data):
    """Create a new user with the provided data"""
    # Hash password before storing
    hashed_password = pbkdf2_sha256.hash(data['password'])
    
    user = User(
        username=data['username'],
        password=hashed_password,
        role=data.get('role'),
        full_name=data.get('full_name')
    )
    
    db.session.add(user)
    db.session.commit()
    
    return user

def get_user_by_id(user_id):
    """Get user by ID"""
    return User.query.get(user_id)

def get_all_users():
    """Get all users"""
    return User.query.all()

def update_user(user_id, data):
    """Update user data"""
    user = User.query.get(user_id)
    if not user:
        return None
        
    if 'username' in data:
        user.username = data['username']
    if 'password' in data:
        user.password = pbkdf2_sha256.hash(data['password'])
    if 'role' in data:
        user.role = data['role']
    if 'full_name' in data:
        user.full_name = data['full_name']
    
    db.session.commit()
    return user

def delete_user(user_id):
    """Delete a user"""
    user = User.query.get(user_id)
    if not user:
        return False
        
    db.session.delete(user)
    db.session.commit()
    return True