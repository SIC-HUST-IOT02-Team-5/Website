from marshmallow import Schema, fields
from app.schemas.user_schema import UserSchema

class ItemUserAccessSchema(Schema):
    id = fields.Int(dump_only=True)
    item_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    granted_by = fields.Int(dump_only=True)
    granted_at = fields.DateTime(dump_only=True)
    
    # Nested user information
    user = fields.Nested(UserSchema, dump_only=True)
