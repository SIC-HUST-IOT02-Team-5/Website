from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models.cell_event_model import LockerEventType

class UserNestedSchema(Schema):
    id = fields.Int()
    full_name = fields.Str()
    email = fields.Str()

class CellNestedSchema(Schema):
    id = fields.Int()
    cell_number = fields.Int()
    location = fields.Str()

class CellEventSchema(Schema):
    id = fields.Int(dump_only=True)
    locker_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    event_type = EnumField(LockerEventType, by_value=True, required=True)
    timestamp = fields.DateTime(dump_only=True)
    
    # Nested relationships
    user = fields.Nested(UserNestedSchema, dump_only=True)
    cell = fields.Nested(CellNestedSchema, dump_only=True)
