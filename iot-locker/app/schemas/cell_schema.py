from marshmallow import Schema, fields, validates, ValidationError
from marshmallow_enum import EnumField
from app.models.cell_model import CellStatus

class CellSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    status = EnumField(CellStatus, by_value=True, default = CellStatus.closed)

    last_open_at = fields.DateTime(dump_only=True)
    last_close_at = fields.DateTime(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates('name')
    def validate_name(self, value):
        allowed_names = {"cell 1", "cell 2", "cell 3", "cell 4"}
        if value.lower() not in allowed_names:
            raise ValidationError("Name must be one of: cell 1, cell 2, cell 3, or cell 4.")
