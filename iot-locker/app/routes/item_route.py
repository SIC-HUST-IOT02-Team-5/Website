
from flask import Blueprint, request, jsonify
from app.services.item_service import ItemService
from app.schemas.item_schema import ItemSchema
from app.models.item_model import ItemStatus
from datetime import datetime

item_bp = Blueprint('item', __name__)
item_schema = ItemSchema()
items_schema = ItemSchema(many=True)



def get_user_role():
    # Tạm thời lấy role từ request args, sau này thay bằng JWT/session
    return request.args.get('role', 'user')

def get_username():
    return request.args.get('username', 'unknown')

@item_bp.route('/items', methods=['POST'])
def create_item():
    user_role = get_user_role()
    data = request.get_json()
    item, error = ItemService.create_item(data, user_role)
    if error:
        return jsonify({'error': error}), 403
    return jsonify(item_schema.dump(item)), 201

@item_bp.route('/items', methods=['GET'])
def get_all_items():
    items = ItemService.get_all_items()
    return jsonify(items_schema.dump(items)), 200

@item_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = ItemService.get_item(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(item_schema.dump(item)), 200

@item_bp.route('/items/<int:item_id>', methods=['PUT', 'PATCH'])
def update_item(item_id):
    user_role = get_user_role()
    username = get_username()
    data = request.get_json()
    # Nếu có update status (mượn/trả), không cần log
    item, error = ItemService.update_item(item_id, data, user_role)
    if error:
        return jsonify({'error': error}), 403
    return jsonify(item_schema.dump(item)), 200

@item_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    user_role = get_user_role()
    success, error = ItemService.delete_item(item_id, user_role)
    if not success:
        return jsonify({'error': error}), 403
    return jsonify({'message': 'Item deleted'}), 200

@item_bp.route('/items/cell/<int:cell_id>', methods=['GET'])
def get_items_by_cell(cell_id):
    items = ItemService.get_all_items()
    filtered = [item for item in items if item.cell_id == cell_id]
    return jsonify(items_schema.dump(filtered)), 200
