# app/routes/cell_route.py
from flask import Blueprint, request, jsonify
from app.schemas.cell_schema import CellSchema
from app.services.cell_service import CellService

cell_bp = Blueprint('cells', __name__)
cell_schema = CellSchema()
cells_schema = CellSchema(many=True)

@cell_bp.route('/cells', methods=['GET'])
def get_cells():
    cells = CellService.get_all_cells()
    return cells_schema.dump(cells), 200

@cell_bp.route('/cells/<int:cell_id>', methods=['GET'])
def get_cell(cell_id):
    cell = CellService.get_cell_by_id(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    return cell_schema.dump(cell), 200

@cell_bp.route('/cells', methods=['POST'])
def create_cell():
    data = request.get_json()
    try:
        validated_data = cell_schema.load(data)
        cell = CellService.create_cell(validated_data)
        return cell_schema.dump(cell), 201
    except Exception as e:
        return {"message": str(e)}, 400

@cell_bp.route('/cells/<int:cell_id>', methods=['PATCH'])
def update_cell(cell_id):
    data = request.get_json()
    try:
        validated_data = cell_schema.load(data, partial=True)
        cell = CellService.update_cell(cell_id, validated_data)
        if not cell:
            return {"message": "Cell not found"}, 404
        return cell_schema.dump(cell), 200
    except Exception as e:
        return {"message": str(e)}, 400

@cell_bp.route('/cells/<int:cell_id>', methods=['DELETE'])
def delete_cell(cell_id):
    cell = CellService.delete_cell(cell_id)
    if not cell:
        return {"message": "Cell not found"}, 404
    return {"message": "Cell deleted"}, 200
