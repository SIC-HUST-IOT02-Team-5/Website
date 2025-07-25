# app/services/cell_service.py
from app.models.cell_model import CellModel
from app.extensions import db
from datetime import datetime

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
    def update_cell(cell_id, data):
        cell = CellModel.query.get(cell_id)
        if not cell:
            return None
        for key, value in data.items():
            if key == "status":
                if value == "OPEN":
                    cell.last_open_at = datetime.utcnow()
                elif value == "CLOSED":
                    cell.last_close_at = datetime.utcnow()
            setattr(cell, key, value)
        db.session.commit()
        return cell

    @staticmethod
    def delete_cell(cell_id):
        cell = CellModel.query.get(cell_id)
        if not cell:
            return None
        db.session.delete(cell)
        db.session.commit()
        return cell
