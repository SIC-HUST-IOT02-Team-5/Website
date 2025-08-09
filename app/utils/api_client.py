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
        self.base_url = config.get("api.base_url", "http://localhost:5000")
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
        return self._make_request("POST", "/login", data) or self._make_request("POST", "/auth/login", data)
    
    def register(self, username: str, password: str, full_name: Optional[str] = None) -> Optional[Dict]:
        """Register first account (default admin)"""
        data = {"username": username, "password": password}
        if full_name:
            data["full_name"] = full_name
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
    
    # Cells
    def get_cells(self, token: str) -> Optional[Dict]:
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", "/cells", headers=headers)
    
    def get_cell(self, token: str, cell_id: str) -> Optional[Dict]:
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("GET", f"/cells/{cell_id}", headers=headers)
    
    # Borrow/Return actions via MQTT endpoints
    def open_locker(self, token: str, locker_id: str, action: str) -> Optional[Dict]:
        headers = {"Authorization": f"Bearer {token}"}
        if action == "borrow":
            return self._make_request("POST", f"/cells/{locker_id}/open", {"action": "open"}, headers)
        else:
            return self._make_request("POST", f"/cells/{locker_id}/open", {"action": "open"}, headers)
    
    def confirm_action(self, token: str, locker_id: str, action: str) -> Optional[Dict]:
        # For now, simulate confirmation by calling close
        headers = {"Authorization": f"Bearer {token}"}
        return self._make_request("POST", f"/cells/{locker_id}/close", {"action": "close"}, headers)
    
    def get_locker_status(self, token: str, locker_id: str) -> Optional[Dict]:
        # Map to GET /cells/<id>
        headers = {"Authorization": f"Bearer {token}"}
        data = self._make_request("GET", f"/cells/{locker_id}", headers=headers)
        if not data:
            return None
        # Normalize
        status_value = data.get("status") if isinstance(data.get("status"), str) else (data.get("status") or {})
        status_str = status_value if isinstance(status_value, str) else status_value.get("value") if isinstance(status_value, dict) else None
        return {"success": True, "status": status_str}