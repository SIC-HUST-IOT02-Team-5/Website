from app.extensions import db
import enum
from sqlalchemy import func

class LockerEventType(enum.Enum):
    open = "open"
    close = "close"

class CellEventModel(db.Model):
    __tablename__ = "cells_events"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    locker_id = db.Column(db.Integer, db.ForeignKey('cells.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_type = db.Column(db.Enum(LockerEventType), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=func.now(), nullable=False)

    # Relationships
    user = db.relationship('UserModel', backref='cell_events')
    cell = db.relationship('CellModel', backref='events')


