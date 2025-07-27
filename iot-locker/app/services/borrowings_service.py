from app.extensions import db
from app.models.borrowings_model import BorrowingModel, BorrowStatus
from app.models.item_model import ItemModel, ItemStatus
from app.models.user_model import UserModel
from datetime import datetime

class BorrowingsService:
    @staticmethod
    def borrow_item(user_id, item_id, expected_return_at, note=None):
        # Kiểm tra user tồn tại
        user = UserModel.query.get(user_id)
        if not user:
            return None, {"error": "User not found"}
        # Kiểm tra item tồn tại và available
        item = ItemModel.query.get(item_id)
        if not item:
            return None, {"error": "Item not found"}
        if item.status != ItemStatus.available:
            return None, {"error": "Item not available"}
        # Tạo bản ghi borrowings
        borrowing = BorrowingModel(
            user_id=user_id,
            item_id=item_id,
            expected_return_at=expected_return_at,
            status=BorrowStatus.borrowing,
            note=note
        )
        item.status = ItemStatus.borrowing
        db.session.add(borrowing)
        db.session.commit()
        return borrowing, None

    @staticmethod
    def return_item(borrowing_id):
        borrowing = BorrowingModel.query.get(borrowing_id)
        if not borrowing or borrowing.status != BorrowStatus.borrowing:
            return None, {"error": "Borrowing not found or already returned"}
        borrowing.returned_at = datetime.utcnow()
        borrowing.status = BorrowStatus.returned
        item = ItemModel.query.get(borrowing.item_id)
        if item:
            item.status = ItemStatus.available
        db.session.commit()
        return borrowing, None