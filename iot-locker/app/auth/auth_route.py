from flask import Blueprint, request, jsonify
from app.schemas.user_schema import UserSchema
from app.auth.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)
user_schema = UserSchema()

# Đăng nhập
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400
    user = AuthService.login(data['username'], data['password'])
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    user_info = {
        "id": user.id,
        "username": user.username,
        "role": user.role.value,
        "full_name": user.full_name
    }
    return jsonify(user_info), 200


# Đăng ký tài khoản đầu tiên (ai cũng có thể, luôn là admin)
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400
    user = AuthService.register_self(data)
    if user is None:
        from app.services.user_service import UserService
        if UserService.get_user_by_username(data['username']):
            return jsonify({"error": "User is already existed"}), 400
        return jsonify({"error": "Unknown error"}), 400
    return user_schema.dump(user), 201

