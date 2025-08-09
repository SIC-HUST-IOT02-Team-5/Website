from app.extensions import db
from app.models.borrowings_model import BorrowingModel, BorrowStatus
from app.models.item_model import ItemModel, ItemStatus
from app.models.user_model import UserModel
from app.models.item_access_model import ItemAccessModel
from datetime import datetime
from app.utils.timezone_helper import get_vn_utc_now

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
        # Kiểm tra quyền truy cập item: nếu item có cấu hình access thì user phải thuộc danh sách
        access_rows = ItemAccessModel.query.filter_by(item_id=item_id).all()
        if access_rows:
            allowed_user_ids = {row.user_id for row in access_rows}
            if user_id not in allowed_user_ids:
                return None, {"error": "User doesn't have access to this item"}

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
    def get_all_borrowings():
        return BorrowingModel.query.options(
            db.joinedload(BorrowingModel.user),
            db.joinedload(BorrowingModel.item)
        ).all()

    @staticmethod
    def return_item(borrowing_id):
        borrowing = BorrowingModel.query.get(borrowing_id)
        if not borrowing or borrowing.status != BorrowStatus.borrowing:
            return None, {"error": "Borrowing not found or already returned"}
        borrowing.returned_at = get_vn_utc_now()
        borrowing.status = BorrowStatus.returned
        item = ItemModel.query.get(borrowing.item_id)
        if item:
            item.status = ItemStatus.available
        db.session.commit()
        return borrowing, None
        
    @staticmethod
    def get_borrowing(borrowing_id):
        return BorrowingModel.query.get(borrowing_id)
        
    @staticmethod
    def get_borrowings_by_cell(cell_id):
        # Lấy danh sách mượn/trả theo cell_id
        # Cần join từ borrowings qua items để lọc theo cell_id
        return BorrowingModel.query.join(
            ItemModel, BorrowingModel.item_id == ItemModel.id
        ).filter(ItemModel.cell_id == cell_id).all()