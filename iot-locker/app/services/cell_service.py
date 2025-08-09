# app/services/cell_service.py
from app.models.cell_model import CellModel
from app.services.cell_event_service import CellEventService
from app.extensions import db
from datetime import datetime
from app.services.mqtt_service import mqtt_service
import logging

logger = logging.getLogger(__name__)

class CellService:
    @staticmethod
    def get_all_cells():
        return CellModel.query.all()

    @staticmethod
    def get_cell_by_id(cell_id):
        return CellModel.query.get(cell_id)

    @staticmethod
    def create_cell(data):
        cell = CellModel(**data)
        db.session.add(cell)
        db.session.commit()
        return cell

    @staticmethod
    def update_cell(cell_id, data, user_id=None):
        
        cell = CellModel.query.get(cell_id)
        if not cell:
            return None
        status_changed = False
        new_status = None
        for key, value in data.items():
            if key == "status":
                # Chuẩn hóa value về enum value ("open"/"closed")
                if isinstance(value, str):
                    value_lower = value.lower()
                else:
                    value_lower = value.value
                if value_lower == "open":
                    cell.last_open_at = datetime.utcnow()
                    status_changed = True
                    new_status = "open"
                elif value_lower == "closed":
                    cell.last_close_at = datetime.utcnow()
                    status_changed = True
                    new_status = "close"
                setattr(cell, key, value)
            else:
                setattr(cell, key, value)
        db.session.commit()
        
        # Ghi event nếu status đổi và có user_id
        if status_changed and user_id:
            CellEventService.create_event(
                locker_id=cell_id,
                user_id=user_id,
                event_type=new_status
            )
            
        # Gửi MQTT command khi thay đổi status qua API
        if status_changed:
            command = "open" if new_status == "open" else "close"
            mqtt_service.publish_command(cell_id, command, {"user_id": user_id})
            logger.info(f"MQTT command sent: {command} to cell {cell_id}")
            
        return cell

    @staticmethod
    def delete_cell(cell_id):
        cell = CellModel.query.get(cell_id)
        if not cell:
            return None
        db.session.delete(cell)
        db.session.commit()
        return cell
