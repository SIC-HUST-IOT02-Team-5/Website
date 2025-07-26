
from app.extensions import db
from app.models.item_model import ItemModel, ItemStatus
from sqlalchemy.exc import SQLAlchemyError

class ItemService:

    @staticmethod
    def create_item(data, user_role):
        if user_role != 'admin':
            return None, 'Permission denied: Only admin can create items.'
        try:
            item = ItemModel(**data)
            db.session.add(item)
            db.session.commit()
            return item, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_item(item_id):
        return ItemModel.query.get(item_id)

    @staticmethod
    def get_all_items():
        return ItemModel.query.all()

    @staticmethod
    def update_item(item_id, data, user_role):
        item = ItemModel.query.get(item_id)
        if not item:
            return None, 'Item not found.'

        # Nếu là admin: được update mọi trường
        if user_role == 'admin':
            try:
                for key, value in data.items():
                    if key == 'status':
                        if value == ItemStatus.borrowing.value and item.status != ItemStatus.available:
                            return None, 'Item must be available to borrow.'
                        if value == ItemStatus.available.value and item.status != ItemStatus.borrowing:
                            return None, 'Item must be borrowed to return.'
                        item.status = ItemStatus(value)
                    elif hasattr(item, key):
                        setattr(item, key, value)
                db.session.commit()
                return item, None
            except SQLAlchemyError as e:
                db.session.rollback()
                return None, str(e)

        # Nếu là user: chỉ được update status (mượn/trả)
        if user_role == 'user':
            if set(data.keys()) - {'status'}:
                return None, 'Permission denied: User can only borrow/return item.'
            if 'status' not in data:
                return None, 'Missing status field.'
            try:
                value = data['status']
                if value == ItemStatus.borrowing.value and item.status != ItemStatus.available:
                    return None, 'Item must be available to borrow.'
                if value == ItemStatus.available.value and item.status != ItemStatus.borrowing:
                    return None, 'Item must be borrowed to return.'
                item.status = ItemStatus(value)
                db.session.commit()
                return item, None
            except SQLAlchemyError as e:
                db.session.rollback()
                return None, str(e)
        return None, 'Permission denied.'

    @staticmethod
    def delete_item(item_id, user_role):
        if user_role != 'admin':
            return False, 'Permission denied: Only admin can delete items.'
        item = ItemModel.query.get(item_id)
        if not item:
            return False, 'Item not found.'
        try:
            db.session.delete(item)
            db.session.commit()
            return True, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, str(e)
