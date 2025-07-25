from app.extensions import db
import enum
from sqlalchemy import func

class CellStatus(enum.Enum):
    open = "open"
    closed = "closed"

class CellisLocked(enum.Enum):
    locked = "locked"
    unlocked = "unlocked"

class CellModel(db.Model):
    __tablename__ = "cells"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    status = db.Column(db.Enum(CellStatus), nullable=False, default=CellStatus.closed)
    is_locked = db.Column(db.Enum(CellisLocked), nullable=False, default=CellisLocked.locked)

    last_open_at = db.Column(db.DateTime, nullable=True)
    last_close_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())
