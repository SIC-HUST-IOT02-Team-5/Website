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
        return "Smart Locker Management System"
    
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
        welcome_label = QLabel("Welcome to the Smart Locker Management System!")
        welcome_font = QFont()
        welcome_font.setPointSize(20)
        welcome_font.setBold(True)
        welcome_label.setFont(welcome_font)
        welcome_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(welcome_label)
        
        # Subtitle
        subtitle_label = QLabel("Please login to continue")
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
        footer_info = QLabel("Automated - Secure - Convenient")
        footer_font = QFont()
        footer_font.setPointSize(12)
        footer_info.setFont(footer_font)
        footer_info.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(footer_info)
    
    def setup_login_buttons(self):
        """Setup login buttons"""
        buttons_layout = QVBoxLayout()
        buttons_layout.setSpacing(20)
        
        # Username/Password Login Button
        self.user_button = QPushButton("👤 Account Login")
        self.user_button.setMinimumHeight(80)
        self.user_button.clicked.connect(self.on_user_login)
        self.style_button(self.user_button, "#4CAF50")
        buttons_layout.addWidget(self.user_button)
        
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
    
    def on_user_login(self):
        """Handle user/pass login button click"""
        self.navigate_to.emit("user_login")
    
    def closeEvent(self, a0):
        """Handle close event"""
        if self.clock_timer:
            self.clock_timer.stop()
        super().closeEvent(a0)