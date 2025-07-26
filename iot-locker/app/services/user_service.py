from app.extensions import db
from app.models.user_model import UserModel
from passlib.hash import pbkdf2_sha256

class UserService:
    @staticmethod
    def get_user_by_username(username):
        return UserModel.query.filter_by(username=username).first()
    @staticmethod
    def create_user(data, creator_role=None):
        """
        Đăng ký qua /register (không truyền role) thì luôn là admin.
        Nếu gọi từ code và truyền 'role' trong data thì sẽ tạo đúng role đó.
        """
        if UserModel.query.filter_by(username=data['username']).first():
            return None

        # Nếu gọi từ code và truyền role, thì dùng role đó
        if 'role' in data and data['role'] in ['admin', 'user']:
            role = data['role']
        else:
            # Đăng ký qua /register (không truyền role) thì luôn là admin
            role = 'admin'

        hashed_password = pbkdf2_sha256.hash(data['password'])
        user = UserModel(
            username=data['username'],
            password=hashed_password,
            role=role,
            full_name=data.get('full_name')
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return UserModel.query.get(user_id)

    @staticmethod
    def get_all_users():
        """Get all users"""
        return UserModel.query.all()

    @staticmethod
    def update_user(user_id, data):
        """Update user data"""
        user = UserModel.query.get(user_id)
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

    @staticmethod
    def delete_user(user_id):
        """Delete a user"""
        user = UserModel.query.get(user_id)
        if not user:
            return False
        db.session.delete(user)
        db.session.commit()
        return True
