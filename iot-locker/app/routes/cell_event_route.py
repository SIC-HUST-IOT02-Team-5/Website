
from flask import Blueprint, request, jsonify
from app.services.cell_event_service import CellEventService
from app.schemas.cell_event_schema import CellEventSchema
from flask_jwt_extended import jwt_required, get_jwt
from app.utils.role_required import role_required

cell_event_bp = Blueprint('cell_event', __name__)
cell_event_schema = CellEventSchema()
cell_events_schema = CellEventSchema(many=True)

# Ghi event (open/close) cho cell

# @cell_event_bp.route('/cells/<int:cell_id>/events', methods=['POST'])
# @jwt_required()


# Lấy tất cả events
@cell_event_bp.route('/cell-events', methods=['GET'])
@jwt_required()
def get_all_events():
    events = CellEventService.get_all_events()
    return jsonify(cell_events_schema.dump(events)), 200

# Lấy log event theo cell
@cell_event_bp.route('/cells/<int:cell_id>/events', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_events(cell_id):
    events = CellEventService.get_events_by_cell(cell_id)
    return jsonify(cell_events_schema.dump(events)), 200
