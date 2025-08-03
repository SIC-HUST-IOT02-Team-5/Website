from app.extensions import db
from sqlalchemy import func
import enum

class BorrowStatus(enum.Enum):
    borrowing = "borrowing"
    returned = "returned"
    overdue = "overdue"

class BorrowingModel(db.Model):
    __tablename__ = "borrowings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    borrowed_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    expected_return_at = db.Column(db.DateTime, nullable=False)
    returned_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum(BorrowStatus), nullable=False, default=BorrowStatus.borrowing)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = db.relationship('UserModel', backref='borrowings')
    item = db.relationship('ItemModel', backref='borrowings')