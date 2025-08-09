#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Welcome Screen (P0) - Main entry point
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QWidget
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QPixmap
from screens.base_screen import BaseScreen
from utils.config import Config

class WelcomeScreen(BaseScreen):
    """Welcome screen - main entry point"""
    
    def __init__(self, config: Config, parent=None):
        super().__init__(config, parent)
        self.setup_welcome_content()
        
        # Setup clock timer
        self.clock_timer = QTimer()
        self.clock_timer.timeout.connect(self.update_clock)
        self.clock_timer.start(1000)  # Update every second
    
    def get_screen_title(self) -> str:
        return "Hệ thống quản lý tủ khóa thông minh"
    
    def setup_welcome_content(self):
        """Setup welcome screen content"""
        # Logo area
        logo_layout = QHBoxLayout()
        logo_layout.addStretch()
        
        # Logo label (placeholder)
        self.logo_label = QLabel("🔐")
        logo_font = QFont()
        logo_font.setPointSize(72)
        self.logo_label.setFont(logo_font)
        self.logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_layout.addWidget(self.logo_label)
        logo_layout.addStretch()
        
        self.content_layout.addLayout(logo_layout)
        
        # Welcome message
        welcome_label = QLabel("Chào mừng bạn đến với hệ thống quản lý tủ khóa!")
        welcome_font = QFont()
        welcome_font.setPointSize(20)
        welcome_font.setBold(True)
        welcome_label.setFont(welcome_font)
        welcome_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(welcome_label)
        
        # Subtitle
        subtitle_label = QLabel("Vui lòng chọn phương thức đăng nhập")
        subtitle_font = QFont()
        subtitle_font.setPointSize(16)
        subtitle_label.setFont(subtitle_font)
        subtitle_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(subtitle_label)
        
        # Add some spacing
        self.content_layout.addStretch()
        
        # Login buttons
        self.setup_login_buttons()
        
        # Add some spacing
        self.content_layout.addStretch()
        
        # Footer info
        footer_info = QLabel("Hệ thống tự động - An toàn - Tiện lợi")
        footer_font = QFont()
        footer_font.setPointSize(12)
        footer_info.setFont(footer_font)
        footer_info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(footer_info)
    
    def setup_login_buttons(self):
        """Setup login buttons"""
        buttons_layout = QVBoxLayout()
        buttons_layout.setSpacing(20)
        
        # RFID Login Button
        self.rfid_button = QPushButton("🔑 Đăng nhập bằng thẻ RFID")
        self.rfid_button.setMinimumHeight(80)
        self.rfid_button.clicked.connect(self.on_rfid_login)
        self.style_button(self.rfid_button, "#4CAF50")
        buttons_layout.addWidget(self.rfid_button)
        
        # Code Login Button
        self.code_button = QPushButton("📝 Nhập mã truy cập")
        self.code_button.setMinimumHeight(80)
        self.code_button.clicked.connect(self.on_code_login)
        self.style_button(self.code_button, "#2196F3")
        buttons_layout.addWidget(self.code_button)
        
        self.content_layout.addLayout(buttons_layout)
    
    def style_button(self, button: QPushButton, color: str):
        """Style a button with custom colors"""
        button_font = QFont()
        button_font.setPointSize(18)
        button_font.setBold(True)
        button.setFont(button_font)
        
        # Set button stylesheet
        button.setStyleSheet(f"""
            QPushButton {{
                background-color: {color};
                color: white;
                border: none;
                border-radius: 10px;
                padding: 15px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {color}DD;
            }}
            QPushButton:pressed {{
                background-color: {color}AA;
            }}
        """)
    
    def on_rfid_login(self):
        """Handle RFID login button click"""
        self.navigate_to.emit("rfid_login")
    
    def on_code_login(self):
        """Handle code login button click"""
        self.navigate_to.emit("code_login")
    
    def closeEvent(self, event):
        """Handle close event"""
        if self.clock_timer:
            self.clock_timer.stop()
        super().closeEvent(event) 