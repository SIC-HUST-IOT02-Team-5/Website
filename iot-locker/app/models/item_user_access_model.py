from app.extensions import db
from sqlalchemy import func

class ItemUserAccessModel(db.Model):
    __tablename__ = "item_user_access"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    granted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    granted_at = db.Column(db.DateTime, server_default=func.now())
    
    # Relationships
    item = db.relationship('ItemModel', backref='user_access')
    user = db.relationship('UserModel', foreign_keys=[user_id], backref='item_access')
    granted_by_user = db.relationship('UserModel', foreign_keys=[granted_by])
    
    # Ensure unique combination of item_id and user_id
    __table_args__ = (db.UniqueConstraint('item_id', 'user_id'),)
