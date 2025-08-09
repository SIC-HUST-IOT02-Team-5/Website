#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Code Login Screen (P2) - JWT token input
"""

from PyQt6.QtWidgets import (QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                             QLineEdit, QGridLayout, QWidget, QProgressBar)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.api_client import APIClient
import logging

class CodeLoginScreen(BaseScreen):
    """Code login screen with virtual keyboard"""
    
    def __init__(self, config: Config, parent=None):
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.logger = logging.getLogger(__name__)
        self.code_input = ""
        
        self.setup_code_content()
        self.setup_virtual_keyboard()
    
    def get_screen_title(self) -> str:
        return "Đăng nhập bằng mã truy cập"
    
    def setup_code_content(self):
        """Setup code login content"""
        # Main message
        message_label = QLabel("Nhập mã truy cập tạm thời")
        message_font = QFont()
        message_font.setPointSize(24)
        message_font.setBold(True)
        message_label.setFont(message_font)
        message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(message_label)
        
        # Code input display
        self.code_display = QLineEdit()
        self.code_display.setReadOnly(True)
        self.code_display.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.code_display.setPlaceholderText("Nhập mã truy cập...")
        
        display_font = QFont()
        display_font.setPointSize(20)
        display_font.setBold(True)
        self.code_display.setFont(display_font)
        
        self.code_display.setStyleSheet("""
            QLineEdit {
                background-color: white;
                border: 3px solid #2196F3;
                border-radius: 10px;
                padding: 15px;
                font-weight: bold;
                color: #333;
            }
        """)
        
        self.content_layout.addWidget(self.code_display)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)
        self.content_layout.addWidget(self.progress_bar)
        
        # Status message
        self.status_label = QLabel("Vui lòng nhập mã truy cập")
        status_font = QFont()
        status_font.setPointSize(16)
        self.status_label.setFont(status_font)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)
        
        # Add spacing
        self.content_layout.addStretch()
    
    def setup_virtual_keyboard(self):
        """Setup virtual keyboard"""
        # Keyboard container
        keyboard_widget = QWidget()
        keyboard_layout = QVBoxLayout(keyboard_widget)
        keyboard_layout.setSpacing(10)
        
        # Number keys (0-9)
        number_layout = QGridLayout()
        number_layout.setSpacing(10)
        
        # Create number buttons
        numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
        positions = [(i, j) for i in range(3) for j in range(3)]
        positions.append((3, 1))  # Position for 0
        
        for i, number in enumerate(numbers):
            if i < 9:
                row, col = positions[i]
            else:
                row, col = positions[9]  # 0 goes in the center bottom
            
            button = QPushButton(number)
            button.setMinimumSize(80, 80)
            button.clicked.connect(lambda checked, num=number: self.add_digit(num))
            self.style_keyboard_button(button)
            number_layout.addWidget(button, row, col)
        
        keyboard_layout.addLayout(number_layout)
        
        # Control buttons
        control_layout = QHBoxLayout()
        control_layout.setSpacing(10)
        
        # Clear button
        clear_button = QPushButton("🗑️ Xóa")
        clear_button.setMinimumHeight(60)
        clear_button.clicked.connect(self.clear_code)
        self.style_button(clear_button, "#FF9800")
        control_layout.addWidget(clear_button)
        
        # Submit button
        submit_button = QPushButton("✅ Xác nhận")
        submit_button.setMinimumHeight(60)
        submit_button.clicked.connect(self.submit_code)
        self.style_button(submit_button, "#4CAF50")
        control_layout.addWidget(submit_button)
        
        keyboard_layout.addLayout(control_layout)
        
        self.content_layout.addWidget(keyboard_widget)
    
    def style_keyboard_button(self, button: QPushButton):
        """Style keyboard number buttons"""
        button_font = QFont()
        button_font.setPointSize(20)
        button_font.setBold(True)
        button.setFont(button_font)
        
        button.setStyleSheet("""
            QPushButton {
                background-color: #E3F2FD;
                color: #1976D2;
                border: 2px solid #2196F3;
                border-radius: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #BBDEFB;
            }
            QPushButton:pressed {
                background-color: #90CAF9;
            }
        """)
    
    def style_button(self, button: QPushButton, color: str):
        """Style control buttons"""
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
    
    def add_digit(self, digit: str):
        """Add digit to code input"""
        if len(self.code_input) < 20:  # Limit code length
            self.code_input += digit
            self.update_display()
    
    def clear_code(self):
        """Clear code input"""
        self.code_input = ""
        self.update_display()
    
    def update_display(self):
        """Update code display"""
        # Show asterisks for security
        display_text = "*" * len(self.code_input)
        self.code_display.setText(display_text)
    
    def submit_code(self):
        """Submit code for authentication"""
        if not self.code_input:
            self.status_label.setText("❌ Vui lòng nhập mã truy cập")
            return
        
        # Show progress
        self.progress_bar.setVisible(True)
        self.status_label.setText("Đang xác thực mã...")
        
        # Disable keyboard
        for child in self.findChildren(QPushButton):
            child.setEnabled(False)
        
        # Authenticate code
        self.authenticate_code(self.code_input)
    
    def authenticate_code(self, code: str):
        """Authenticate JWT code with backend"""
        try:
            # Call API
            response = self.api_client.login_code(code)
            
            if response and response.get("success"):
                # Login successful
                token = response.get("token")
                user_info = response.get("user", {})
                
                self.logger.info(f"Code login successful for user: {user_info.get('name', 'Unknown')}")
                
                # Store user data
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
                error_msg = response.get("message", "Mã truy cập không hợp lệ") if response else "Lỗi kết nối"
                self.show_error(f"❌ {error_msg}")
                self.logger.warning(f"Code login failed: {error_msg}")
                
        except Exception as e:
            self.logger.error(f"Error during code authentication: {e}")
            self.show_error("❌ Lỗi hệ thống")
    
    def show_error(self, message: str):
        """Show error message and allow retry"""
        self.status_label.setText(message)
        self.progress_bar.setVisible(False)
        
        # Re-enable keyboard
        for child in self.findChildren(QPushButton):
            child.setEnabled(True)
        
        # Clear code after error
        QTimer.singleShot(2000, self.clear_code)
    
    def keyPressEvent(self, event):
        """Handle keyboard input"""
        if event.key() >= Qt.Key.Key_0 and event.key() <= Qt.Key.Key_9:
            digit = str(event.key() - Qt.Key.Key_0)
            self.add_digit(digit)
        elif event.key() == Qt.Key.Key_Backspace:
            self.code_input = self.code_input[:-1] if self.code_input else ""
            self.update_display()
        elif event.key() == Qt.Key.Key_Return or event.key() == Qt.Key.Key_Enter:
            self.submit_code()
        else:
            super().keyPressEvent(event) 