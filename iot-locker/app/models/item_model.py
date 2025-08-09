from app.extensions import db
import enum
from sqlalchemy import func, Enum
from app.utils.timezone_helper import vn_func_now

from app.models.cell_model import CellModel

class ItemStatus(enum.Enum):
    available = "available"
    borrowing = "borrowed"
    lost = "lost"

class ItemModel(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cell_id = db.Column(db.Integer, db.ForeignKey('cells.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=True)
    status = db.Column(db.Enum(ItemStatus), nullable=False, default=ItemStatus.available)
    created_at = db.Column(db.DateTime, server_default=vn_func_now())
    updated_at = db.Column(db.DateTime, server_default=vn_func_now(), onupdate=vn_func_now())

    cell = db.relationship(CellModel, backref='items')