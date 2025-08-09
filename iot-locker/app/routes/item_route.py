from flask import Blueprint, request, jsonify
from app.services.item_service import ItemService
from app.schemas.item_schema import ItemSchema
from flask_jwt_extended import jwt_required, get_jwt
from app.utils.role_required import role_required
from app.services.item_access_service import ItemAccessService
from app.schemas.user_schema import UserSchema

item_bp = Blueprint('item', __name__)
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)
users_schema = UserSchema(many=True)




@item_bp.route('/items', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_item():
    claims = get_jwt()
    role = claims.get('role', 'user')
    data = request.get_json()
    item, error = ItemService.create_item(data, role)
    if error:
        return jsonify({'error': error}), 403
    return jsonify(item_schema.dump(item)), 201

@item_bp.route('/items', methods=['GET'])
@jwt_required()
def get_all_items():
    items = ItemService.get_all_items()
    return jsonify(items_schema.dump(items)), 200

@item_bp.route('/items/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item(item_id):
    item = ItemService.get_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(item_schema.dump(item)), 200

@item_bp.route('/items/<int:item_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_item(item_id):
    claims = get_jwt()
    role = claims.get('role', 'user')
    username = claims.get('sub', 'unknown')
    data = request.get_json()
    # Nếu có update status (mượn/trả), không cần log
    item, error = ItemService.update_item(item_id, data, role)
    if error:
        return jsonify({'error': error}), 403
    return jsonify(item_schema.dump(item)), 200

@item_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_item(item_id):
    claims = get_jwt()
    role = claims.get('role', 'user')
    success, error = ItemService.delete_item(item_id, role)
    if not success:
        return jsonify({'error': error}), 403
    return jsonify({'message': 'Item deleted'}), 200

@item_bp.route('/items/cell/<int:cell_id>', methods=['GET'])
@jwt_required()
def get_items_by_cell(cell_id):
    items = ItemService.get_all_items()
    filtered = [item for item in items if item.cell_id == cell_id]
    return jsonify(items_schema.dump(filtered)), 200

@item_bp.route('/items/<int:item_id>/access', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_item_access(item_id):
    users = ItemAccessService.list_users_for_item(item_id)
    return jsonify(users_schema.dump(users)), 200

@item_bp.route('/items/<int:item_id>/access', methods=['PUT'])
@jwt_required()
@role_required('admin')
def set_item_access(item_id):
    data = request.get_json() or {}
    user_ids = data.get('user_ids', [])
    ok, err = ItemAccessService.set_item_access(item_id, user_ids)
    if not ok:
        return jsonify({'error': err or 'Unable to set access'}), 400
    users = ItemAccessService.list_users_for_item(item_id)
    return jsonify(users_schema.dump(users)), 200

@item_bp.route('/items/<int:item_id>/access/<int:user_id>', methods=['POST'])
@jwt_required()
@role_required('admin')
def add_user_access(item_id, user_id):
    ok, err = ItemAccessService.add_user_to_item(item_id, user_id)
    if not ok:
        return jsonify({'error': err or 'Unable to add access'}), 400
    return jsonify({'message': 'Access granted'}), 200

@item_bp.route('/items/<int:item_id>/access/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def remove_user_access(item_id, user_id):
    ok, err = ItemAccessService.remove_user_from_item(item_id, user_id)
    if not ok:
        return jsonify({'error': err or 'Unable to revoke access'}), 400
    return jsonify({'message': 'Access revoked'}), 200
