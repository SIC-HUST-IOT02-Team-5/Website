from flask import Blueprint, request, jsonify
from app.services.cell_event_service import CellEventService
from app.schemas.cell_event_schema import CellEventSchema

cell_event_bp = Blueprint('cell_event', __name__)
cell_event_schema = CellEventSchema()
cell_events_schema = CellEventSchema(many=True)

# Ghi event (open/close) cho cell
@cell_event_bp.route('/cells/<int:cell_id>/events', methods=['POST'])


# Lấy log event theo cell
@cell_event_bp.route('/cells/<int:cell_id>/events', methods=['GET'])
def get_events(cell_id):
    events = CellEventService.get_events_by_cell(cell_id)
    return jsonify(cell_events_schema.dump(events)), 200
