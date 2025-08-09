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
        return "Chọn hành động"
    
    def setup_action_content(self):
        """Setup action selection content"""
        # Welcome message with user name
        user_name = self.user_data.get("user_info", {}).get("name", "Người dùng")
        welcome_label = QLabel(f"Xin chào, {user_name}!")
        welcome_font = QFont()
        welcome_font.setPointSize(28)
        welcome_font.setBold(True)
        welcome_label.setFont(welcome_font)
        welcome_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(welcome_label)
        
        # Subtitle
        subtitle_label = QLabel("Bạn muốn thực hiện hành động gì?")
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
        self.borrow_button = QPushButton("📦 Mượn thiết bị")
        self.borrow_button.setMinimumHeight(100)
        self.borrow_button.clicked.connect(self.on_borrow_clicked)
        self.style_action_button(self.borrow_button, "#4CAF50", "Mượn thiết bị từ tủ khóa")
        buttons_layout.addWidget(self.borrow_button)
        
        # Return button
        self.return_button = QPushButton("🔄 Trả thiết bị")
        self.return_button.setMinimumHeight(100)
        self.return_button.clicked.connect(self.on_return_clicked)
        self.style_action_button(self.return_button, "#2196F3", "Trả thiết bị vào tủ khóa")
        buttons_layout.addWidget(self.return_button)
        
        self.content_layout.addLayout(buttons_layout)
    
    def style_action_button(self, button: QPushButton, color: str, description: str):
        """Style action buttons with description"""
        # Create container widget
        container = QWidget()
        container_layout = QVBoxLayout(container)
        container_layout.setContentsMargins(0, 0, 0, 0)
        container_layout.setSpacing(5)
        
        # Style the button
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
                transform: scale(1.02);
            }}
            QPushButton:pressed {{
                background-color: {color}AA;
            }}
        """)
        
        container_layout.addWidget(button)
        
        # Add description
        desc_label = QLabel(description)
        desc_font = QFont()
        desc_font.setPointSize(14)
        desc_label.setFont(desc_font)
        desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        desc_label.setStyleSheet("color: #666;")
        container_layout.addWidget(desc_label)
        
        # Replace button with container in parent layout
        parent_layout = button.parent().layout()
        if parent_layout:
            index = parent_layout.indexOf(button)
            parent_layout.removeWidget(button)
            parent_layout.insertWidget(index, container)
    
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
        
        # Department/role
        department = user_info.get("department", "N/A")
        dept_label = QLabel(f"Phòng ban: {department}")
        dept_font = QFont()
        dept_font.setPointSize(12)
        dept_label.setFont(dept_font)
        dept_label.setStyleSheet("color: #666;")
        info_layout.addWidget(dept_label)
        
        self.content_layout.addLayout(info_layout)
    
    def on_borrow_clicked(self):
        """Handle borrow button click"""
        self.logger.info("User selected borrow action")
        self.navigate_to.emit("locker_select_borrow")
    
    def on_return_clicked(self):
        """Handle return button click"""
        self.logger.info("User selected return action")
        self.navigate_to.emit("locker_select_return")
    
    def closeEvent(self, event):
        """Handle close event"""
        if self.clock_timer:
            self.clock_timer.stop()
        super().closeEvent(event) 