from app.extensions import db
import enum
from sqlalchemy import func
from app.utils.timezone_helper import vn_func_now

class UserRole(enum.Enum):
    admin = "admin"
    user = "user"

class UserModel(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.user)
    full_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, server_default=vn_func_now())
    updated_at = db.Column(db.DateTime, server_default=vn_func_now(), onupdate=vn_func_now())
