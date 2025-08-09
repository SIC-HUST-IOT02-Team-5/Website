#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Demo application for testing without backend
"""

import sys
import os
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon
from app_manager import AppManager
from utils.config import Config
from utils.logger import setup_logger

# Mock API responses for demo
MOCK_RESPONSES = {
    "rfid_login": {
        "success": True,
        "token": "demo_token_12345",
        "user": {
            "id": "USER001",
            "name": "Nguyễn Văn A",
            "department": "IT Department",
            "email": "user@example.com"
        }
    },
    "code_login": {
        "success": True,
        "token": "demo_token_12345",
        "user": {
            "id": "USER002",
            "name": "Trần Thị B",
            "department": "HR Department",
            "email": "user2@example.com"
        }
    },
    "available_lockers": {
        "success": True,
        "lockers": [
            {
                "id": "LOCKER001",
                "name": "Tủ khóa A1",
                "compartment": "A1-01",
                "device_name": "Laptop Dell XPS 13",
                "status": "available"
            },
            {
                "id": "LOCKER002",
                "name": "Tủ khóa A2",
                "compartment": "A2-01",
                "device_name": "iPad Pro 12.9",
                "status": "available"
            },
            {
                "id": "LOCKER003",
                "name": "Tủ khóa B1",
                "compartment": "B1-01",
                "device_name": "iPhone 15 Pro",
                "status": "available"
            }
        ]
    },
    "user_lockers": {
        "success": True,
        "lockers": [
            {
                "id": "LOCKER004",
                "name": "Tủ khóa C1",
                "compartment": "C1-01",
                "device_name": "MacBook Air M2",
                "status": "borrowed",
                "borrowed_date": "2024-01-15 09:30:00"
            }
        ]
    }
}

class MockAPIClient:
    """Mock API client for demo purposes"""
    
    def __init__(self, config):
        self.config = config
        self.mock_users = {
            "DEMO_CARD_12345": {
                "id": "1",
                "username": "demo_user",
                "name": "Nguyễn Văn Demo",
                "email": "demo@example.com",
                "role": "user"
            }
        }
        self.mock_cells = [
            {
                "id": "1",
                "name": "Tủ A - Ngăn 1",
                "compartment": "A1",
                "status": "available",
                "device_name": "Laptop Dell XPS 13",
                "description": "Laptop cao cấp cho phát triển"
            },
            {
                "id": "2", 
                "name": "Tủ A - Ngăn 2",
                "compartment": "A2",
                "status": "available",
                "device_name": "iPad Pro 12.9",
                "description": "Máy tính bảng cho thiết kế"
            },
            {
                "id": "3",
                "name": "Tủ B - Ngăn 1", 
                "compartment": "B1",
                "status": "borrowed",
                "device_name": "MacBook Air M2",
                "description": "Laptop Apple cho lập trình",
                "borrowed_date": "2025-07-29 10:30:00"
            }
        ]
        self.mock_borrowings = []
    
    # Authentication Endpoints
    def login(self, username, password):
        """Mock login"""
        print(f"Mock login with username: {username}")
        return {
            "success": True,
            "token": "mock_jwt_token_12345",
            "user": self.mock_users.get("DEMO_CARD_12345", {})
        }
    
    def register(self, username, password, email=None):
        """Mock register"""
        print(f"Mock register: {username}")
        return {
            "success": True,
            "message": "User registered successfully"
        }
    
    # User Management Endpoints
    def create_user(self, token, user_data):
        """Mock create user"""
        print(f"Mock create user: {user_data}")
        return {"success": True, "user_id": "new_user_id"}
    
    def get_users(self, token):
        """Mock get users"""
        print(f"Mock get users with token: {token}")
        return {"success": True, "users": list(self.mock_users.values())}
    
    def get_user(self, token, user_id):
        """Mock get user"""
        print(f"Mock get user {user_id}")
        return {"success": True, "user": self.mock_users.get("DEMO_CARD_12345", {})}
    
    def update_user(self, token, user_id, user_data):
        """Mock update user"""
        print(f"Mock update user {user_id}: {user_data}")
        return {"success": True}
    
    def delete_user(self, token, user_id):
        """Mock delete user"""
        print(f"Mock delete user {user_id}")
        return {"success": True}
    
    # Item Management Endpoints
    def create_item(self, token, item_data):
        """Mock create item"""
        print(f"Mock create item: {item_data}")
        return {"success": True, "item_id": "new_item_id"}
    
    def get_items(self, token):
        """Mock get items"""
        print(f"Mock get items with token: {token}")
        return {"success": True, "items": []}
    
    def get_item(self, token, item_id):
        """Mock get item"""
        print(f"Mock get item {item_id}")
        return {"success": True, "item": {}}
    
    def update_item(self, token, item_id, item_data):
        """Mock update item"""
        print(f"Mock update item {item_id}: {item_data}")
        return {"success": True}
    
    def delete_item(self, token, item_id):
        """Mock delete item"""
        print(f"Mock delete item {item_id}")
        return {"success": True}
    
    def get_items_by_cell(self, token, cell_id):
        """Mock get items by cell"""
        print(f"Mock get items by cell {cell_id}")
        return {"success": True, "items": []}
    
    # Cell Management Endpoints
    def get_cells(self, token):
        """Mock get cells"""
        print(f"Mock get cells with token: {token}")
        return {"success": True, "cells": self.mock_cells}
    
    def get_cell(self, token, cell_id):
        """Mock get cell"""
        print(f"Mock get cell {cell_id}")
        cell = next((c for c in self.mock_cells if c["id"] == cell_id), None)
        return {"success": True, "cell": cell} if cell else {"success": False}
    
    def create_cell(self, token, cell_data):
        """Mock create cell"""
        print(f"Mock create cell: {cell_data}")
        return {"success": True, "cell_id": "new_cell_id"}
    
    def update_cell(self, token, cell_id, cell_data):
        """Mock update cell"""
        print(f"Mock update cell {cell_id}: {cell_data}")
        return {"success": True}
    
    def delete_cell(self, token, cell_id):
        """Mock delete cell"""
        print(f"Mock delete cell {cell_id}")
        return {"success": True}
    
    # Borrowing Management Endpoints
    def create_borrowing(self, token, borrowing_data):
        """Mock create borrowing"""
        print(f"Mock create borrowing: {borrowing_data}")
        borrowing_id = f"borrowing_{len(self.mock_borrowings) + 1}"
        borrowing = {
            "id": borrowing_id,
            "cell_id": borrowing_data.get("cell_id"),
            "user_id": "1",
            "borrowed_at": "2025-07-29 21:30:00",
            "status": "active"
        }
        self.mock_borrowings.append(borrowing)
        return {"success": True, "borrowing_id": borrowing_id, "start_time": borrowing["borrowed_at"]}
    
    def return_item(self, token, borrowing_id):
        """Mock return item"""
        print(f"Mock return item for borrowing {borrowing_id}")
        return {"success": True, "returned_at": "2025-07-29 21:35:00"}
    
    # Cell Event Endpoints
    def get_cell_events(self, token, cell_id):
        """Mock get cell events"""
        print(f"Mock get cell events for {cell_id}")
        return {"success": True, "events": []}
    
    # Legacy methods for backward compatibility
    def login_rfid(self, rfid_uid):
        """Mock RFID login"""
        print(f"Mock RFID login with UID: {rfid_uid}")
        return {
            "success": True,
            "token": "mock_jwt_token_12345",
            "user": self.mock_users.get(rfid_uid, self.mock_users["DEMO_CARD_12345"])
        }
    
    def login_code(self, jwt_token):
        """Mock code login"""
        print(f"Mock code login with token: {jwt_token}")
        return {
            "success": True,
            "token": jwt_token,
            "user": self.mock_users["DEMO_CARD_12345"]
        }
    
    def get_user_info(self, token):
        """Mock get user info"""
        print(f"Mock get user info with token: {token}")
        return {
            "success": True,
            "user": self.mock_users["DEMO_CARD_12345"]
        }
    
    def get_available_lockers(self, token):
        """Mock get available lockers"""
        print(f"Mock get available lockers with token: {token}")
        available_cells = [c for c in self.mock_cells if c["status"] == "available"]
        return {
            "success": True,
            "lockers": available_cells
        }
    
    def get_user_lockers(self, token):
        """Mock get user lockers"""
        print(f"Mock get user lockers with token: {token}")
        borrowed_cells = [c for c in self.mock_cells if c["status"] == "borrowed"]
        return {
            "success": True,
            "lockers": borrowed_cells
        }
    
    def open_locker(self, token, locker_id, action):
        """Mock open locker"""
        print(f"Mock open locker {locker_id} for {action}")
        if action == "borrow":
            return self.create_borrowing(token, {"cell_id": locker_id})
        else:
            return {"success": True, "message": "Locker opened for return"}
    
    def confirm_action(self, token, locker_id, action):
        """Mock confirm action"""
        print(f"Mock confirm action {action} for locker {locker_id}")
        return {"success": True}
    
    def get_locker_status(self, token, locker_id):
        """Mock get locker status"""
        print(f"Mock get locker status for {locker_id} with token: {token}")
        cell = next((c for c in self.mock_cells if c["id"] == locker_id), None)
        return {"success": True, "status": cell["status"] if cell else "unknown"}

class MockRFIDReader:
    """Mock RFID reader for demo purposes"""
    
    def __init__(self, config, callback=None):
        self.config = config
        self.callback = callback
        self.is_reading = False
    
    def start_reading(self):
        """Mock start reading"""
        print("Mock RFID reader started")
        self.is_reading = True
        
        # Simulate RFID card detection after 3 seconds
        import threading
        import time
        
        def simulate_card():
            time.sleep(3)
            if self.is_reading and self.callback:
                print("Mock RFID card detected: DEMO_CARD_12345")
                self.callback("DEMO_CARD_12345")
        
        threading.Thread(target=simulate_card, daemon=True).start()
        return True
    
    def stop_reading(self):
        """Mock stop reading"""
        print("Mock RFID reader stopped")
        self.is_reading = False
    
    def disconnect(self):
        """Mock disconnect"""
        print("Mock RFID reader disconnected")
    
    def is_connected(self):
        """Mock connection status"""
        return True

class DemoMainWindow(QMainWindow):
    """Demo main window"""
    
    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self.setup_window()
        self.setup_app_manager()
    
    def setup_window(self):
        """Setup main window"""
        self.setWindowTitle("Demo - Hệ thống quản lý tủ khóa thông minh")
        self.setWindowState(Qt.WindowState.WindowFullScreen)
        
        # Set window icon if available
        icon_path = os.path.join(os.path.dirname(__file__), "assets", "icon.png")
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))
    
    def setup_app_manager(self):
        """Setup application manager with mock components"""
        self.app_manager = AppManager(self.config)
        
        # Replace API client with mock
        self.app_manager.rfid_login_screen.api_client = MockAPIClient(self.config)
        self.app_manager.code_login_screen.api_client = MockAPIClient(self.config)
        self.app_manager.action_select_screen.api_client = MockAPIClient(self.config)
        self.app_manager.confirm_action_screen.api_client = MockAPIClient(self.config)
        self.app_manager.countdown_screen.api_client = MockAPIClient(self.config)
        
        # Replace RFID reader with mock (only if not already in demo mode)
        if not self.config.get("rfid.demo_mode", False):
            self.app_manager.rfid_login_screen.rfid_reader = MockRFIDReader(self.config)
        
        self.setCentralWidget(self.app_manager.get_stacked_widget())

def main():
    """Main function to start the demo application"""
    # Setup logging
    logger = setup_logger()
    logger.info("Starting Demo Locker Management Application")
    
    # Create Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("Demo Locker Management System")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("Smart Locker Demo")
    
    # Load configuration
    config = Config()
    
    # Create and show main window
    main_window = DemoMainWindow(config)
    main_window.show()
    
    print("=" * 60)
    print("DEMO MODE - Hệ thống quản lý tủ khóa thông minh")
    print("=" * 60)
    print("Hướng dẫn sử dụng demo:")
    print("1. Chọn 'Đăng nhập bằng thẻ RFID' - sẽ tự động đăng nhập thành công")
    print("2. Chọn 'Nhập mã truy cập' - nhập bất kỳ mã nào để đăng nhập")
    print("3. Chọn hành động 'Mượn thiết bị' hoặc 'Trả thiết bị'")
    print("4. Chọn tủ khóa từ danh sách")
    print("5. Xác nhận hành động")
    print("6. Theo dõi đếm ngược thời gian")
    print("7. Hoàn tất hoặc đợi tự động hoàn tất")
    print("=" * 60)
    
    # Start application event loop
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 