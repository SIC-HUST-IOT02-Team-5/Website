#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RFID Login Screen (P1) - RFID card reading
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QProgressBar
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QFont, QPalette, QColor
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.rfid_reader import RFIDReader
from utils.api_client import APIClient
import logging

class RFIDLoginScreen(BaseScreen):
    """RFID login screen"""
    
    def __init__(self, config: Config, parent=None):
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.rfid_reader = RFIDReader(config, self.on_rfid_detected)
        self.logger = logging.getLogger(__name__)
        
        self.setup_rfid_content()
        self.start_rfid_reading()
    
    def get_screen_title(self) -> str:
        return "Đăng nhập bằng thẻ RFID"
    
    def setup_rfid_content(self):
        """Setup RFID login content"""
        # Main message
        self.message_label = QLabel("Vui lòng quét thẻ RFID của bạn")
        message_font = QFont()
        message_font.setPointSize(24)
        message_font.setBold(True)
        self.message_label.setFont(message_font)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.message_label)
        
        # RFID icon
        self.rfid_icon = QLabel("🔑")
        icon_font = QFont()
        icon_font.setPointSize(96)
        self.rfid_icon.setFont(icon_font)
        self.rfid_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.rfid_icon)
        
        # Status message
        self.status_label = QLabel("Đang chờ quét thẻ...")
        status_font = QFont()
        status_font.setPointSize(18)
        self.status_label.setFont(status_font)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.content_layout.addWidget(self.progress_bar)
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Instructions
        instructions = QLabel("Hướng dẫn:\n1. Đặt thẻ RFID lên đầu đọc\n2. Giữ nguyên cho đến khi có thông báo\n3. Đợi hệ thống xác thực")
        instructions_font = QFont()
        instructions_font.setPointSize(14)
        instructions.setFont(instructions_font)
        instructions.setAlignment(Qt.AlignmentFlag.AlignCenter)
        instructions.setWordWrap(True)
        self.content_layout.addWidget(instructions)
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Cancel button
        self.cancel_button = QPushButton("❌ Hủy bỏ")
        self.cancel_button.setMinimumHeight(60)
        self.cancel_button.clicked.connect(self.on_cancel)
        self.style_button(self.cancel_button, "#F44336")
        self.content_layout.addWidget(self.cancel_button)
    
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
        """)
    
    def start_rfid_reading(self):
        """Start RFID reading"""
        if self.rfid_reader.start_reading():
            self.status_label.setText("Đang chờ quét thẻ...")
            self.logger.info("Started RFID reading")
        else:
            self.status_label.setText("❌ Lỗi kết nối RFID reader")
            self.logger.error("Failed to start RFID reading")
    
    def on_rfid_detected(self, rfid_uid: str):
        """Handle RFID card detection"""
        self.logger.info(f"RFID card detected: {rfid_uid}")
        
        # Update UI
        self.status_label.setText("Đang xác thực thẻ...")
        self.progress_bar.setVisible(True)
        self.cancel_button.setEnabled(False)
        
        # Stop RFID reading
        self.rfid_reader.stop_reading()
        
        # Call API to authenticate
        self.authenticate_rfid(rfid_uid)
    
    def authenticate_rfid(self, rfid_uid: str):
        """Authenticate RFID with backend"""
        try:
            # Call API
            response = self.api_client.login_rfid(rfid_uid)
            
            if response and response.get("success"):
                # Login successful
                token = response.get("token")
                user_info = response.get("user", {})
                
                self.logger.info(f"RFID login successful for user: {user_info.get('name', 'Unknown')}")
                
                # Store user data (you might want to use a session manager)
                self.user_data = {
                    "token": token,
                    "user_info": user_info
                }
                
                # Store in app manager if available
                if hasattr(self, 'app_manager'):
                    self.app_manager.store_user_data(self.user_data)
                
                # Navigate to action selection
                self.navigate_to.emit("action_select")
                
            else:
                # Login failed
                error_msg = response.get("message", "Đăng nhập thất bại") if response else "Lỗi kết nối"
                self.show_error(f"❌ {error_msg}")
                self.logger.warning(f"RFID login failed: {error_msg}")
                
        except Exception as e:
            self.logger.error(f"Error during RFID authentication: {e}")
            self.show_error("❌ Lỗi hệ thống")
    
    def show_error(self, message: str):
        """Show error message and allow retry"""
        self.status_label.setText(message)
        self.progress_bar.setVisible(False)
        self.cancel_button.setEnabled(True)
        
        # Change icon to error
        self.rfid_icon.setText("❌")
        
        # Restart RFID reading after delay
        QTimer.singleShot(3000, self.restart_rfid_reading)
    
    def restart_rfid_reading(self):
        """Restart RFID reading"""
        self.rfid_icon.setText("🔑")
        self.status_label.setText("Đang chờ quét thẻ...")
        self.start_rfid_reading()
    
    def on_cancel(self):
        """Handle cancel button click"""
        self.rfid_reader.stop_reading()
        self.go_back.emit()
    
    def closeEvent(self, event):
        """Handle close event"""
        self.rfid_reader.disconnect()
        super().closeEvent(event) 