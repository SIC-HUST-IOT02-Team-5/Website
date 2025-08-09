#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API client for backend communication
"""

import requests
import json
import logging
from typing import Dict, Any, Optional
from utils.config import Config

class APIClient:
    """API client for communicating with backend"""
    
    def __init__(self, config: Config):
        self.config = config
        self.base_url = config.get("api.base_url", "http://localhost:8000")
        self.timeout = config.get("api.timeout", 30)
        self.retry_attempts = config.get("api.retry_attempts", 3)
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     headers: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request with retry logic"""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.retry_attempts):
            try:
                if method.upper() == "GET":
                    response = self.session.get(url, timeout=self.timeout, headers=headers)
                elif method.upper() == "POST":
                    response = self.session.post(url, json=data, timeout=self.timeout, headers=headers)
                elif method.upper() == "PUT":
                    response = self.session.put(url, json=data, timeout=self.timeout, headers=headers)
                elif method.upper() == "PATCH":
                    response = self.session.patch(url, json=data, timeout=self.timeout, headers=headers)
                elif method.upper() == "DELETE":
                    response = self.session.delete(url, timeout=self.timeout, headers=headers)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                self.logger.warning(f"API request failed (attempt {attempt + 1}/{self.retry_attempts}): {e}")
                if attempt == self.retry_attempts - 1:
                    self.logger.error(f"API request failed after {self.retry_attempts} attempts")
                    return None
        
        return None
    
    # Authentication Endpoints (/auth)
    def login(self, username: str, password: str) -> Optional[Dict]:
        """Login and receive JWT token"""
        data = {"username": username, "password": password}
        return self._make_request("POST", "/auth/login", data)
    
    def register(self, username: str, password: str, email: str = None) -> Optional[Dict]:
        """Register first account (default admin)"""
        data = {"username": username, "password": password}
        if email:
            data["email"] = email
        return self._make_request("POST", "/auth/register", data)
    
    # User Management Endpoints (/users)
    def create_user(self, token: str, user_data: Dict) -> Optional[Dict]:
        """Create new user (admin only)"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", "/users", user_data, headers)
    
    def get_users(self, token: str) -> Optional[Dict]:
        """Get all users list"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/users", headers=headers)
    
    def get_user(self, token: str, user_id: str) -> Optional[Dict]:
        """Get user info by ID"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/users/{user_id}", headers=headers)
    
    def update_user(self, token: str, user_id: str, user_data: Dict) -> Optional[Dict]:
        """Update user info"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("PATCH", f"/users/{user_id}", user_data, headers)
    
    def delete_user(self, token: str, user_id: str) -> Optional[Dict]:
        """Delete user"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("DELETE", f"/users/{user_id}", headers=headers)
    
    # Item Management Endpoints (/items)
    def create_item(self, token: str, item_data: Dict) -> Optional[Dict]:
        """Create new item"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", "/items", item_data, headers)
    
    def get_items(self, token: str) -> Optional[Dict]:
        """Get all items list"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/items", headers=headers)
    
    def get_item(self, token: str, item_id: str) -> Optional[Dict]:
        """Get item info by ID"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/items/{item_id}", headers=headers)
    
    def update_item(self, token: str, item_id: str, item_data: Dict) -> Optional[Dict]:
        """Update item info"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("PATCH", f"/items/{item_id}", item_data, headers)
    
    def delete_item(self, token: str, item_id: str) -> Optional[Dict]:
        """Delete item"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("DELETE", f"/items/{item_id}", headers=headers)
    
    def get_items_by_cell(self, token: str, cell_id: str) -> Optional[Dict]:
        """Get items list in specific cell"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/items/cell/{cell_id}", headers=headers)
    
    # Cell Management Endpoints (/cells)
    def get_cells(self, token: str) -> Optional[Dict]:
        """Get all cells list"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/cells", headers=headers)
    
    def get_cell(self, token: str, cell_id: str) -> Optional[Dict]:
        """Get cell info by ID"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/cells/{cell_id}", headers=headers)
    
    def create_cell(self, token: str, cell_data: Dict) -> Optional[Dict]:
        """Create new cell"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", "/cells", cell_data, headers)
    
    def update_cell(self, token: str, cell_id: str, cell_data: Dict) -> Optional[Dict]:
        """Update cell info"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("PATCH", f"/cells/{cell_id}", cell_data, headers)
    
    def delete_cell(self, token: str, cell_id: str) -> Optional[Dict]:
        """Delete cell"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("DELETE", f"/cells/{cell_id}", headers=headers)
    
    # Borrowing Management Endpoints (/borrowings)
    def create_borrowing(self, token: str, borrowing_data: Dict) -> Optional[Dict]:
        """Create borrowing record"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", "/borrowings", borrowing_data, headers)
    
    def return_item(self, token: str, borrowing_id: str) -> Optional[Dict]:
        """Return item (complete borrowing)"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("PATCH", f"/borrowings/{borrowing_id}/return", headers=headers)
    
    # Cell Event Endpoints (/cells/<cell_id>/events)
    def get_cell_events(self, token: str, cell_id: str) -> Optional[Dict]:
        """Get cell events log (open/close)"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/cells/{cell_id}/events", headers=headers)
    
    # Legacy methods for backward compatibility
    def login_rfid(self, rfid_uid: str) -> Optional[Dict]:
        """Login with RFID UID (legacy method)"""
        # For now, we'll use the regular login endpoint
        # In the future, this might be a separate RFID endpoint
        data = {"rfid_uid": rfid_uid}
        return self._make_request("POST", "/auth/rfid", data)
    
    def login_code(self, jwt_token: str) -> Optional[Dict]:
        """Login with JWT token (legacy method)"""
        # This might be used for token validation
        headers = {"Authorization": f"Bearer {jwt_token}"}
        return self._make_request("GET", "/auth/validate", headers=headers)
    
    def get_user_info(self, token: str) -> Optional[Dict]:
        """Get user information (legacy method)"""
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/users/me", headers=headers)
    
    def get_available_lockers(self, token: str) -> Optional[Dict]:
        """Get available lockers for borrowing (legacy method)"""
        # This maps to available cells
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/cells/available", headers=headers)
    
    def get_user_lockers(self, token: str) -> Optional[Dict]:
        """Get user's borrowed lockers (legacy method)"""
        # This maps to user's active borrowings
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/borrowings/active", headers=headers)
    
    def open_locker(self, token: str, locker_id: str, action: str) -> Optional[Dict]:
        """Open locker for borrow/return (legacy method)"""
        # This maps to creating a borrowing or returning an item
        if action == "borrow":
            # Create borrowing record
            borrowing_data = {"cell_id": locker_id}
            return self.create_borrowing(token, borrowing_data)
        else:
            # Return item - we need to find the active borrowing first
            # For now, we'll use a simplified approach
            return self._make_request("POST", f"/cells/{locker_id}/open", 
                                    {"action": action}, 
                                    {"Authorization": f"Bearer {token}"})
    
    def confirm_action(self, token: str, locker_id: str, action: str) -> Optional[Dict]:
        """Confirm borrow/return action (legacy method)"""
        # This might be used for additional confirmation
        data = {"cell_id": locker_id, "action": action}
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", "/cells/confirm", data, headers)
    
    def get_locker_status(self, token: str, locker_id: str) -> Optional[Dict]:
        """Get locker status (legacy method)"""
        # This maps to cell status
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/cells/{locker_id}/status", headers=headers) 