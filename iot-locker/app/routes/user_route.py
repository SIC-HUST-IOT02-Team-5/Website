
from flask import Blueprint, request, jsonify
from app.schemas.user_schema import UserSchema
from app.services.user_service import UserService
from app.auth.auth_service import AuthService
from flask_jwt_extended import jwt_required
from app.utils.token_helper import get_current_user, is_admin

user_bp = Blueprint('user_bp', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Admin tạo user mới (role tuỳ chọn, chỉ cho phép nếu đang đăng nhập là admin)
@user_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user_route():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400
    if not is_admin():
        return jsonify({"error": "Permission denied: Only admin can create users."}), 403
    user, error = AuthService.create_user_by_admin(data, 'admin')
    if user is None:
        return jsonify({"error": error}), 403 if error and 'Permission denied' in error else 400
    return user_schema.dump(user), 201

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = UserService.get_all_users()
    return users_schema.dump(users), 200


@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return user_schema.dump(user), 200


@user_bp.route('/users/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user_route(user_id):
    data = request.get_json()
    user = UserService.update_user(user_id, data)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return user_schema.dump(user), 200


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user_route(user_id):
    success = UserService.delete_user(user_id)
    if not success:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200
