from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models.cell_event_model import LockerEventType

class CellEventSchema(Schema):
    id = fields.Int(dump_only=True)
    locker_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    event_type = EnumField(LockerEventType, by_value=True, required=True)
    timestamp = fields.DateTime(dump_only=True)
