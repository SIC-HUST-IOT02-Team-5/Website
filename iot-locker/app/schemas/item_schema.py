from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models.item_model import ItemStatus

class ItemSchema(Schema):
    id = fields.Int(dump_only=True)
    cell_id = fields.Int(required=True)
    name = fields.Str(required=True)
    description = fields.Str(required = False, allow_none = True)
    status = EnumField(ItemStatus, by_value = True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
