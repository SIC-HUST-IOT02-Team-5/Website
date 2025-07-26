from app.services.user_service import UserService
from passlib.hash import pbkdf2_sha256

class AuthService:
    @staticmethod
    def login(username, password):
        user = UserService.get_user_by_username(username)
        if not user or not pbkdf2_sha256.verify(password, user.password):
            return None
        return user

    @staticmethod
    def register_self(data):
        # Không cho truyền role, luôn là admin
        data = dict(data)
        data.pop('role', None)
        return UserService.create_user(data)

    @staticmethod
    def create_user_by_admin(data, creator_role=None):
        # Chỉ admin mới được tạo user khác, role tuỳ chọn
        if creator_role != 'admin':
            return None, 'Permission denied: Only admin can create users.'
        if UserService.get_user_by_username(data['username']):
            return None, 'User is already existed'
        return UserService.create_user(data, creator_role), None
