# app/routes/cell_route.py
from flask_jwt_extended import jwt_required, get_jwt
from flask import Blueprint, request, jsonify
from app.schemas.cell_schema import CellSchema
from app.services.cell_service import CellService
from app.utils.role_required import role_required

cell_bp = Blueprint('cells', __name__)
cell_schema = CellSchema()
cells_schema = CellSchema(many=True)

@cell_bp.route('/cells', methods=['GET'])
@jwt_required()
def get_cells():
    cells = CellService.get_all_cells()
    return cells_schema.dump(cells), 200

@cell_bp.route('/cells/<int:cell_id>', methods=['GET'])
@jwt_required()
def get_cell(cell_id):
    cell = CellService.get_cell_by_id(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    return cell_schema.dump(cell), 200

@cell_bp.route('/cells', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_cell():
    data = request.get_json()
    try:
        validated_data = cell_schema.load(data)
        cell = CellService.create_cell(validated_data)
        return cell_schema.dump(cell), 201
    except Exception as e:
        return {"message": str(e)}, 400

@cell_bp.route('/cells/<int:cell_id>', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def update_cell(cell_id):
    data = request.get_json()
    claims = get_jwt()
    user_id = claims.get('sub')  # Get user_id from JWT claims
    try:
        validated_data = cell_schema.load(data, partial=True)
        # Pass user_id to the service
        cell = CellService.update_cell(cell_id, validated_data, user_id=user_id)
        if not cell:
            return {"message": "Cell not found"}, 404
        return cell_schema.dump(cell), 200
    except Exception as e:
        return {"message": str(e)}, 400

@cell_bp.route('/cells/<int:cell_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_cell(cell_id):
    cell = CellService.delete_cell(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    return {"message": "Cell deleted"}, 200
    
@cell_bp.route('/cells/<int:cell_id>/borrowings', methods=['GET'])
@jwt_required()
def get_cell_borrowings(cell_id):
    from app.services.borrowings_service import BorrowingsService
    from app.schemas.borrowings_schema import BorrowingSchema
    
    borrowings = BorrowingsService.get_borrowings_by_cell(cell_id)
    return jsonify(BorrowingSchema(many=True).dump(borrowings)), 200

# MQTT Control Endpoints
@cell_bp.route('/cells/<int:cell_id>/open', methods=['POST'])
@jwt_required()
def open_cell(cell_id):
    """Gửi lệnh mở cell qua MQTT"""
    from app.services.mqtt_service import mqtt_service
    
    claims = get_jwt()
    user_id = claims.get('sub')
    role = claims.get('role', 'user')
    
    # Kiểm tra cell tồn tại
    cell = CellService.get_cell_by_id(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    
    # Gửi lệnh mở qua MQTT
    success = mqtt_service.publish_command(cell_id, "open", {"user_id": user_id})
    
    if success:
        return {"message": f"Open command sent to cell {cell_id}"}, 200
    else:
        return {"message": "Failed to send command"}, 500

@cell_bp.route('/cells/<int:cell_id>/close', methods=['POST'])
@jwt_required()
def close_cell(cell_id):
    """Gửi lệnh đóng cell qua MQTT"""
    from app.services.mqtt_service import mqtt_service
    
    claims = get_jwt()
    user_id = claims.get('sub')
    role = claims.get('role', 'user')
    
    # Kiểm tra cell tồn tại
    cell = CellService.get_cell_by_id(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    
    # Gửi lệnh đóng qua MQTT
    success = mqtt_service.publish_command(cell_id, "close", {"user_id": user_id})
    
    if success:
        return {"message": f"Close command sent to cell {cell_id}"}, 200
    else:
        return {"message": "Failed to send command"}, 500
