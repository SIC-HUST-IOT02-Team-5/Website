from app.extensions import db
from app.utils.timezone_helper import vn_func_now


class ItemAccessModel(db.Model):
    __tablename__ = 'item_access'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=vn_func_now())

    __table_args__ = (
        db.UniqueConstraint('item_id', 'user_id', name='uq_item_user_access'),
    )
