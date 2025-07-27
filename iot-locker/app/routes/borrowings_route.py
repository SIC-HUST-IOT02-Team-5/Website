from flask import Blueprint, request, jsonify
from app.schemas.borrowings_schema import BorrowingSchema
from app.services.borrowings_service import BorrowingsService

borrowings_bp = Blueprint('borrowings_bp', __name__)
borrowing_schema = BorrowingSchema()
borrowings_schema = BorrowingSchema(many=True)

@borrowings_bp.route('/borrowings', methods=['POST'])
def borrow_item():
    data = request.get_json()
    errors = borrowing_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400
    borrowing, error = BorrowingsService.borrow_item(
        user_id=data['user_id'],
        item_id=data['item_id'],
        expected_return_at=data['expected_return_at'],
        note=data.get('note')
    )
    if error:
        return jsonify({"error": error}), 400
    return borrowing_schema.dump(borrowing), 201

@borrowings_bp.route('/borrowings/<int:borrowing_id>/return', methods=['PATCH'])
def return_item(borrowing_id):
    borrowing, error = BorrowingsService.return_item(borrowing_id)
    if error:
        return jsonify({"error": error}), 400
    return borrowing_schema.dump(borrowing), 200