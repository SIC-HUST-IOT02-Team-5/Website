from app.extensions import db
import enum
from sqlalchemy import func
from app.utils.timezone_helper import vn_func_now

class CellStatus(enum.Enum):
    open = "open"
    closed = "closed"

class CellModel(db.Model):
    __tablename__ = "cells"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    status = db.Column(db.Enum(CellStatus), nullable=False, default=CellStatus.closed)

    last_open_at = db.Column(db.DateTime, nullable=True)
    last_close_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, server_default=vn_func_now())
    updated_at = db.Column(db.DateTime, server_default=vn_func_now(), onupdate=vn_func_now())
