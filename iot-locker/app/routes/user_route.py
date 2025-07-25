
from flask import Blueprint, request, jsonify
from app.schemas.user_schema import UserSchema
from app.services.user_service import UserService


user_bp = Blueprint('user_bp', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)


@user_bp.route('/users', methods=['POST'])
def create_user_route():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400

    user = UserService.create_user(data)
    if user is None:
        return jsonify({"error": "user is already existed"}), 400
    return user_schema.dump(user), 201


@user_bp.route('/users', methods=['GET'])
def get_users():
    users = UserService.get_all_users()
    return users_schema.dump(users), 200


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return user_schema.dump(user), 200


@user_bp.route('/users/<int:user_id>', methods=['PATCH'])
def update_user_route(user_id):
    data = request.get_json()
    user = UserService.update_user(user_id, data)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return user_schema.dump(user), 200


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_route(user_id):
    success = UserService.delete_user(user_id)
    if not success:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User deleted successfully"}), 200
