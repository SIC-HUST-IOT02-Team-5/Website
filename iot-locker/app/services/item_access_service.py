from typing import List, Tuple, Optional
from sqlalchemy.exc import SQLAlchemyError
from app.extensions import db
from app.models.item_model import ItemModel
from app.models.user_model import UserModel
from app.models.item_access_model import ItemAccessModel


class ItemAccessService:
    @staticmethod
    def list_users_for_item(item_id: int) -> List[UserModel]:
        q = (
            db.session.query(UserModel)
            .join(ItemAccessModel, ItemAccessModel.user_id == UserModel.id)
            .filter(ItemAccessModel.item_id == item_id)
            .order_by(UserModel.full_name.asc())
        )
        return q.all()

    @staticmethod
    def list_items_for_user(user_id: int) -> List[ItemModel]:
        q = (
            db.session.query(ItemModel)
            .join(ItemAccessModel, ItemAccessModel.item_id == ItemModel.id)
            .filter(ItemAccessModel.user_id == user_id)
            .order_by(ItemModel.name.asc())
        )
        return q.all()

    @staticmethod
    def set_item_access(item_id: int, user_ids: List[int]) -> Tuple[bool, Optional[str]]:
        try:
            # Ensure item exists
            item = ItemModel.query.get(item_id)
            if not item:
                return False, 'Item not found.'

            # Remove existing
            ItemAccessModel.query.filter_by(item_id=item_id).delete()

            # Insert new unique pairs
            unique_user_ids = sorted(set(int(uid) for uid in user_ids))
            for uid in unique_user_ids:
                # Skip if user not exist
                if not UserModel.query.get(uid):
                    continue
                db.session.add(ItemAccessModel(item_id=item_id, user_id=uid))
            db.session.commit()
            return True, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def add_user_to_item(item_id: int, user_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not ItemModel.query.get(item_id):
                return False, 'Item not found.'
            if not UserModel.query.get(user_id):
                return False, 'User not found.'
            exists = ItemAccessModel.query.filter_by(item_id=item_id, user_id=user_id).first()
            if exists:
                return True, None
            db.session.add(ItemAccessModel(item_id=item_id, user_id=user_id))
            db.session.commit()
            return True, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, str(e)

    @staticmethod
    def remove_user_from_item(item_id: int, user_id: int) -> Tuple[bool, Optional[str]]:
        try:
            row = ItemAccessModel.query.filter_by(item_id=item_id, user_id=user_id).first()
            if not row:
                return True, None
            db.session.delete(row)
            db.session.commit()
            return True, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, str(e)
