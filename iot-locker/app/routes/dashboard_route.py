from flask import Blueprint, jsonify
from app.services.item_service import ItemService
from app.services.user_service import UserService
from app.services.cell_service import CellService
from app.services.borrowings_service import BorrowingsService
from app.models.item_model import ItemStatus
from flask_jwt_extended import jwt_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Get all data
        items = ItemService.get_all_items()
        users = UserService.get_all_users()
        cells = CellService.get_all_cells()
        borrowings = BorrowingsService.get_all_borrowings()
        
        # Calculate stats
        total_items = len(items)
        total_users = len(users)
        total_cells = len(cells)
        
        # Get available items count
        available_items = len([item for item in items if item.status == ItemStatus.available])
        
        # Get active borrowings count
        active_borrowings = len([b for b in borrowings if not b.returned_at])
        
        # Get recent activities (last 10 borrowings)
        recent_borrowings = sorted(borrowings, key=lambda x: x.borrowed_at, reverse=True)[:10]
        
        stats = {
            "total_items": total_items,
            "total_users": total_users,
            "total_cells": total_cells,
            "available_items": available_items,
            "active_borrowings": active_borrowings,
            "recent_activities": [{
                "id": b.id,
                "user_name": b.user.full_name,
                "item_name": b.item.name,
                "borrowed_at": b.borrowed_at.isoformat(),
                "expected_return_at": b.expected_return_at.isoformat(),
                "status": "returned" if b.returned_at else "active"
            } for b in recent_borrowings]
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
