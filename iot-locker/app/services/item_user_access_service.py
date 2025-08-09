from app.extensions import db
from app.models.item_user_access_model import ItemUserAccessModel
from app.models.item_model import ItemModel
from app.models.user_model import UserModel
from sqlalchemy.exc import SQLAlchemyError

class ItemUserAccessService:

    @staticmethod
    def get_item_user_access(item_id):
        """Get all users who have access to a specific item"""
        try:
            access_records = ItemUserAccessModel.query.filter_by(item_id=item_id).all()
            return access_records, None
        except SQLAlchemyError as e:
            return None, str(e)

    @staticmethod
    def grant_item_access(item_id, user_id, granted_by_user_id):
        """Grant access to an item for a specific user"""
        try:
            # Check if item exists
            item = ItemModel.query.get(item_id)
            if not item:
                return None, 'Item not found'
            
            # Check if user exists
            user = UserModel.query.get(user_id)
            if not user:
                return None, 'User not found'
            
            # Check if access already exists
            existing_access = ItemUserAccessModel.query.filter_by(
                item_id=item_id, 
                user_id=user_id
            ).first()
            
            if existing_access:
                return None, 'User already has access to this item'
            
            # Create new access record
            access_record = ItemUserAccessModel(
                item_id=item_id,
                user_id=user_id,
                granted_by=granted_by_user_id
            )
            
            db.session.add(access_record)
            db.session.commit()
            
            return access_record, None
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def revoke_item_access(item_id, user_id):
        """Revoke access to an item for a specific user"""
        try:
            access_record = ItemUserAccessModel.query.filter_by(
                item_id=item_id,
                user_id=user_id
            ).first()
            
            if not access_record:
                return False, 'Access record not found'
            
            db.session.delete(access_record)
            db.session.commit()
            
            return True, None
            
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def user_has_access(item_id, user_id):
        """Check if a user has access to a specific item"""
        try:
            access_record = ItemUserAccessModel.query.filter_by(
                item_id=item_id,
                user_id=user_id
            ).first()
            
            return access_record is not None, None
            
        except SQLAlchemyError as e:
            return False, str(e)

    @staticmethod
    def get_user_accessible_items(user_id):
        """Get all items that a user has access to"""
        try:
            access_records = ItemUserAccessModel.query.filter_by(user_id=user_id).all()
            item_ids = [record.item_id for record in access_records]
            items = ItemModel.query.filter(ItemModel.id.in_(item_ids)).all()
            return items, None
        except SQLAlchemyError as e:
            return None, str(e)
