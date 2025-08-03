from flask import Blueprint, request, jsonify
from app.schemas.borrowings_schema import BorrowingSchema
from app.services.borrowings_service import BorrowingsService
from flask_jwt_extended import jwt_required, get_jwt
from app.utils.role_required import role_required

borrowings_bp = Blueprint('borrowings_bp', __name__)
borrowing_schema = BorrowingSchema()
borrowings_schema = BorrowingSchema(many=True)

@borrowings_bp.route('/borrowings', methods=['POST'])
@jwt_required()
def borrow_item():
    data = request.get_json()
    claims = get_jwt()
    user_id = claims.get('sub')  # Get user_id from JWT claims
    
    errors = borrowing_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400
    borrowing, error = BorrowingsService.borrow_item(
        user_id=user_id,
        item_id=data['item_id'],
        expected_return_at=data['expected_return_at'],
        note=data.get('note')
    )
    if error:
        return jsonify({"error": error}), 400
    return borrowing_schema.dump(borrowing), 201

@borrowings_bp.route('/borrowings', methods=['GET'])
@jwt_required()
def get_all_borrowings():
    borrowings = BorrowingsService.get_all_borrowings()
    return borrowings_schema.dump(borrowings), 200

@borrowings_bp.route('/borrowings/<int:borrowing_id>/return', methods=['PATCH'])
@jwt_required()
def return_item(borrowing_id):
    borrowing, error = BorrowingsService.return_item(borrowing_id)
    if error:
        return jsonify({"error": error}), 400
    return borrowing_schema.dump(borrowing), 200

@borrowings_bp.route('/borrowings', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_borrowings():
    borrowings = BorrowingsService.get_all_borrowings()
    return jsonify(borrowings_schema.dump(borrowings)), 200

@borrowings_bp.route('/borrowings/<int:borrowing_id>', methods=['GET'])
@jwt_required()
def get_borrowing(borrowing_id):
    borrowing = BorrowingsService.get_borrowing(borrowing_id)
    if not borrowing:
        return jsonify({"error": "Borrowing not found"}), 404
    return jsonify(borrowing_schema.dump(borrowing)), 200