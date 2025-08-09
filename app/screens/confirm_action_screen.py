#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confirm Action Screen (P5) - Confirm borrow/return action
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QProgressBar, QWidget
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.api_client import APIClient
import logging

class ConfirmActionScreen(BaseScreen):
    """Confirm action screen"""
    
    def __init__(self, config: Config, user_data: dict = None, locker_data: dict = None, parent=None):
        # Initialize data before calling super().__init__ to avoid AttributeError
        self.user_data = user_data or {}
        self.locker_data = locker_data or {}
        
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.logger = logging.getLogger(__name__)
        
        self.setup_confirm_content()
    
    def get_screen_title(self) -> str:
        action_type = self.locker_data.get("action_type", "unknown")
        if action_type == "borrow":
            return "Xác nhận mượn thiết bị"
        else:
            return "Xác nhận trả thiết bị"
    
    def setup_confirm_content(self):
        """Setup confirmation content"""
        # Main message
        action_type = self.locker_data.get("action_type", "unknown")
        if action_type == "borrow":
            message = "Xác nhận mượn thiết bị"
        else:
            message = "Xác nhận trả thiết bị"
        
        self.message_label = QLabel(message)
        message_font = QFont()
        message_font.setPointSize(24)
        message_font.setBold(True)
        self.message_label.setFont(message_font)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.message_label)
        
        # Locker information
        self.setup_locker_info()
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Action icon
        if action_type == "borrow":
            icon = "📦"
        else:
            icon = "🔄"
        
        self.action_icon = QLabel(icon)
        icon_font = QFont()
        icon_font.setPointSize(72)
        self.action_icon.setFont(icon_font)
        self.action_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.action_icon)
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)
        self.content_layout.addWidget(self.progress_bar)
        
        # Status message
        self.status_label = QLabel("Vui lòng xác nhận hành động")
        status_font = QFont()
        status_font.setPointSize(16)
        self.status_label.setFont(status_font)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)
        
        # Action buttons
        self.setup_action_buttons()
    
    def setup_locker_info(self):
        """Setup locker information display"""
        locker = self.locker_data.get("locker", {})
        action_type = self.locker_data.get("action_type", "unknown")
        
        # Create info container
        info_container = QWidget()
        info_container.setStyleSheet("""
            QWidget {
                background-color: #f5f5f5;
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        
        info_layout = QVBoxLayout(info_container)
        info_layout.setSpacing(10)
        
        # Locker name
        locker_name = locker.get("name", "Tủ khóa")
        name_label = QLabel(f"Tủ khóa: {locker_name}")
        name_font = QFont()
        name_font.setPointSize(18)
        name_font.setBold(True)
        name_label.setFont(name_font)
        info_layout.addWidget(name_label)
        
        # Compartment number
        compartment = locker.get("compartment", "N/A")
        comp_label = QLabel(f"Số ngăn: {compartment}")
        comp_font = QFont()
        comp_font.setPointSize(16)
        comp_label.setFont(comp_font)
        info_layout.addWidget(comp_label)
        
        # Device information
        if action_type == "borrow":
            device_name = locker.get("device_name", "Thiết bị")
            device_label = QLabel(f"Thiết bị: {device_name}")
            device_font = QFont()
            device_font.setPointSize(16)
            device_label.setFont(device_font)
            info_layout.addWidget(device_label)
        else:
            borrowed_date = locker.get("borrowed_date", "N/A")
            date_label = QLabel(f"Ngày mượn: {borrowed_date}")
            date_font = QFont()
            date_font.setPointSize(16)
            date_label.setFont(date_font)
            info_layout.addWidget(date_label)
        
        # Status
        status = locker.get("status", "Khả dụng")
        status_label = QLabel(f"Trạng thái: {status}")
        status_font = QFont()
        status_font.setPointSize(16)
        status_label.setFont(status_font)
        info_layout.addWidget(status_label)
        
        self.content_layout.addWidget(info_container)
    
    def setup_action_buttons(self):
        """Setup action buttons"""
        buttons_layout = QHBoxLayout()
        buttons_layout.setSpacing(20)
        
        # Cancel button
        self.cancel_button = QPushButton("❌ Hủy bỏ")
        self.cancel_button.setMinimumHeight(60)
        self.cancel_button.clicked.connect(self.on_cancel)
        self.style_button(self.cancel_button, "#F44336")
        buttons_layout.addWidget(self.cancel_button)
        
        # Confirm button
        action_type = self.locker_data.get("action_type", "unknown")
        if action_type == "borrow":
            confirm_text = "🔓 Mở tủ mượn"
        else:
            confirm_text = "🔓 Mở tủ trả"
        
        self.confirm_button = QPushButton(confirm_text)
        self.confirm_button.setMinimumHeight(60)
        self.confirm_button.clicked.connect(self.on_confirm)
        self.style_button(self.confirm_button, "#4CAF50")
        buttons_layout.addWidget(self.confirm_button)
        
        self.content_layout.addLayout(buttons_layout)
    
    def style_button(self, button: QPushButton, color: str):
        """Style a button"""
        button_font = QFont()
        button_font.setPointSize(16)
        button_font.setBold(True)
        button.setFont(button_font)
        
        button.setStyleSheet(f"""
            QPushButton {{
                background-color: {color};
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {color}DD;
            }}
            QPushButton:pressed {{
                background-color: {color}AA;
            }}
            QPushButton:disabled {{
                background-color: #ccc;
                color: #666;
            }}
        """)
    
    def on_confirm(self):
        """Handle confirm button click"""
        # Disable buttons
        self.confirm_button.setEnabled(False)
        self.cancel_button.setEnabled(False)
        
        # Show progress
        self.progress_bar.setVisible(True)
        self.status_label.setText("Đang gửi yêu cầu mở tủ...")
        
        # Send open locker request
        self.open_locker()
    
    def open_locker(self):
        """Send open locker request to API"""
        try:
            token = self.user_data.get("token")
            locker = self.locker_data.get("locker", {})
            action_type = self.locker_data.get("action_type", "unknown")
            locker_id = locker.get("id")
            
            if not token or not locker_id:
                self.show_error("❌ Dữ liệu không hợp lệ")
                return
            
            # Call API to open locker
            response = self.api_client.open_locker(token, locker_id, action_type)
            
            if response and response.get("success"):
                # Locker opened successfully
                self.logger.info(f"Locker {locker_id} opened for {action_type}")
                
                # Store action data for countdown screen
                self.action_data = {
                    "locker": locker,
                    "action_type": action_type,
                    "start_time": response.get("start_time"),
                    "session_id": response.get("session_id")
                }
                
                # Store in app manager if available
                if hasattr(self, 'app_manager'):
                    self.app_manager.store_action_data(self.action_data)
                
                # Navigate to countdown screen
                self.navigate_to.emit("countdown")
                
            else:
                error_msg = response.get("message", "Lỗi mở tủ") if response else "Lỗi kết nối"
                self.show_error(f"❌ {error_msg}")
                
        except Exception as e:
            self.logger.error(f"Error opening locker: {e}")
            self.show_error("❌ Lỗi hệ thống")
    
    def show_error(self, message: str):
        """Show error message and allow retry"""
        self.status_label.setText(message)
        self.progress_bar.setVisible(False)
        
        # Re-enable buttons
        self.confirm_button.setEnabled(True)
        self.cancel_button.setEnabled(True)
    
    def on_cancel(self):
        """Handle cancel button click"""
        self.go_back.emit() 