from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models.borrowings_model import BorrowStatus

class BorrowingSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    item_id = fields.Int(required=True)
    borrowed_at = fields.DateTime(dump_only=True)
    expected_return_at = fields.DateTime(required=True)
    returned_at = fields.DateTime(allow_none=True)
    status = EnumField(BorrowStatus, by_value=True)
    note = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)