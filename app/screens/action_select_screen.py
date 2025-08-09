#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Action Select Screen (P3) - Choose borrow or return
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QWidget
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
import logging

class ActionSelectScreen(BaseScreen):
    """Action selection screen"""
    
    def __init__(self, config: Config, user_data: dict = None, parent=None):
        super().__init__(config, parent)
        self.user_data = user_data or {}
        self.logger = logging.getLogger(__name__)
        self.setup_action_content()
        
        # Setup clock timer
        self.clock_timer = QTimer()
        self.clock_timer.timeout.connect(self.update_clock)
        self.clock_timer.start(1000)
    
    def get_screen_title(self) -> str:
        return "Select Action"
    
    def setup_action_content(self):
        """Setup action selection content"""
        # Welcome message with user name
        user_info = self.user_data.get("user_info", {})
        user_name = user_info.get("full_name") or user_info.get("username") or "User"
        welcome_label = QLabel(f"Hello, {user_name}!")
        welcome_font = QFont()
        welcome_font.setPointSize(28)
        welcome_font.setBold(True)
        welcome_label.setFont(welcome_font)
        welcome_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(welcome_label)
        
        # Subtitle
        subtitle_label = QLabel("What would you like to do?")
        subtitle_font = QFont()
        subtitle_font.setPointSize(20)
        subtitle_label.setFont(subtitle_font)
        subtitle_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(subtitle_label)
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Action buttons
        self.setup_action_buttons()
        
        # Add spacing
        self.content_layout.addStretch()
        
        # User info
        self.setup_user_info()
    
    def setup_action_buttons(self):
        """Setup action selection buttons"""
        buttons_layout = QVBoxLayout()
        buttons_layout.setSpacing(30)
        
        # Borrow button
        self.borrow_button = QPushButton("📦 Borrow Device")
        self.borrow_button.setMinimumHeight(100)
        self.borrow_button.clicked.connect(self.on_borrow_clicked)
        self.style_action_button(self.borrow_button, "#4CAF50", "Borrow device from locker")
        buttons_layout.addWidget(self.borrow_button)
        
        # Return button
        self.return_button = QPushButton("🔄 Return Device")
        self.return_button.setMinimumHeight(100)
        self.return_button.clicked.connect(self.on_return_clicked)
        self.style_action_button(self.return_button, "#2196F3", "Return device to locker")
        buttons_layout.addWidget(self.return_button)
        
        self.content_layout.addLayout(buttons_layout)
    
    def style_action_button(self, button: QPushButton, color: str, description: str):
        """Style action buttons with description"""
        # Style the button directly without container to avoid layout issues
        button_font = QFont()
        button_font.setPointSize(22)
        button_font.setBold(True)
        button.setFont(button_font)
        
        button.setStyleSheet(f"""
            QPushButton {{
                background-color: {color};
                color: white;
                border: none;
                border-radius: 15px;
                padding: 20px;
                font-weight: bold;
                text-align: center;
            }}
            QPushButton:hover {{
                background-color: {color}DD;
            }}
            QPushButton:pressed {{
                background-color: {color}AA;
            }}
        """)
        
        # Set tooltip instead of complex layout
        button.setToolTip(description)
    
    def setup_user_info(self):
        """Setup user information display"""
        user_info = self.user_data.get("user_info", {})
        
        info_layout = QHBoxLayout()
        
        # User ID
        user_id = user_info.get("id", "N/A")
        id_label = QLabel(f"ID: {user_id}")
        id_font = QFont()
        id_font.setPointSize(12)
        id_label.setFont(id_font)
        id_label.setStyleSheet("color: #666;")
        info_layout.addWidget(id_label)
        
        info_layout.addStretch()
        
        # Role
        role = user_info.get("role", "N/A")
        role_label = QLabel(f"Role: {role}")
        role_font = QFont()
        role_font.setPointSize(12)
        role_label.setFont(role_font)
        role_label.setStyleSheet("color: #666;")
        info_layout.addWidget(role_label)
        
        self.content_layout.addLayout(info_layout)
    
    def on_borrow_clicked(self):
        """Handle borrow button click"""
        self.logger.info("User selected borrow action")
        self.navigate_to.emit("locker_select_borrow")
    
    def on_return_clicked(self):
        """Handle return button click"""
        self.logger.info("User selected return action")
        self.navigate_to.emit("locker_select_return")
    
    def closeEvent(self, a0):
        """Handle close event"""
        if self.clock_timer:
            self.clock_timer.stop()
        super().closeEvent(a0)