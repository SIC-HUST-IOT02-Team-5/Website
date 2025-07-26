from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models.user_model import UserRole

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)  # password only for input, not output
    role = EnumField(UserRole, by_value=True, default = UserRole.user)
    full_name = fields.Str(required = True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
