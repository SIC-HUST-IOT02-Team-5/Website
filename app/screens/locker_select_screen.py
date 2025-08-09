#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Locker Select Screen (P4a/P4b) - Choose locker for borrow/return
"""

from PyQt6.QtWidgets import (QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                             QScrollArea, QWidget, QGridLayout, QProgressBar)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.api_client import APIClient
import logging

class LockerSelectScreen(BaseScreen):
    """Locker selection screen for borrow/return"""
    
    def __init__(self, config: Config, user_data: dict = None, action_type: str = "borrow", parent=None):
        # Initialize data before calling super().__init__ to avoid AttributeError
        self.user_data = user_data or {}
        self.action_type = action_type  # "borrow" or "return"
        
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.logger = logging.getLogger(__name__)
        self.lockers = []
        self.selected_locker = None
        
        self.setup_locker_content()
        self.load_lockers()
    
    def get_screen_title(self) -> str:
        if self.action_type == "borrow":
            return "Select Locker to Borrow"
        else:
            return "Select Locker to Return"
    
    def setup_locker_content(self):
        """Setup locker selection content"""
        # Header message
        if self.action_type == "borrow":
            message = "Choose a locker to open for borrowing"
        else:
            message = "Choose a locker you borrowed to return"
        
        self.message_label = QLabel(message)
        message_font = QFont()
        message_font.setPointSize(22)
        message_font.setBold(True)
        self.message_label.setFont(message_font)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.message_label)
        
        # Progress bar for loading
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)
        self.content_layout.addWidget(self.progress_bar)
        
        # Status message
        self.status_label = QLabel("Đang tải danh sách tủ khóa...")
        status_font = QFont()
        status_font.setPointSize(16)
        self.status_label.setFont(status_font)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)
        
        # Scroll area for lockers
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        
        # Container widget for lockers
        self.lockers_widget = QWidget()
        self.lockers_layout = QGridLayout(self.lockers_widget)
        self.lockers_layout.setSpacing(15)
        self.lockers_layout.setContentsMargins(20, 20, 20, 20)
        
        self.scroll_area.setWidget(self.lockers_widget)
        self.content_layout.addWidget(self.scroll_area)
        
        # Confirm button
        self.confirm_button = QPushButton("✅ Xác nhận")
        self.confirm_button.setMinimumHeight(60)
        self.confirm_button.clicked.connect(self.on_confirm)
        self.confirm_button.setEnabled(False)
        self.style_button(self.confirm_button, "#4CAF50")
        self.content_layout.addWidget(self.confirm_button)
    
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
    
    def load_lockers(self):
        """Load lockers from API"""
        self.progress_bar.setVisible(True)
        self.status_label.setText("Loading locker list...")
        
        token = self.user_data.get("token")
        if not token:
            self.show_error("❌ No authentication token")
            return
        
        try:
            # Fetch all cells and display them (filtering can be added later)
            response = self.api_client.get_cells(token)
            if isinstance(response, list):
                # Backend returns list directly
                self.lockers = response
                self.display_lockers()
            elif response:
                # Unknown shape
                self.lockers = response.get("data") or response.get("cells") or []
                self.display_lockers()
            else:
                self.show_error("❌ Connection error")
                
        except Exception as e:
            self.logger.error(f"Error loading lockers: {e}")
            self.show_error("❌ System error")
    
    def display_lockers(self):
        """Display lockers in grid layout"""
        self.progress_bar.setVisible(False)
        
        if not self.lockers:
            self.status_label.setText("No lockers available")
            return

        self.status_label.setText(f"Found {len(self.lockers)} lockers")        # Clear existing lockers
        for i in reversed(range(self.lockers_layout.count())):
            widget = self.lockers_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()
        
        # Add lockers to grid
        cols = 3  # 3 columns
        for i, locker in enumerate(self.lockers):
            row = i // cols
            col = i % cols
            locker_widget = self.create_locker_widget(locker)
            self.lockers_layout.addWidget(locker_widget, row, col)
    
    def create_locker_widget(self, locker: dict) -> QWidget:
        """Create a locker widget"""
        container = QWidget()
        container.setFixedSize(200, 150)
        container.setStyleSheet("""
            QWidget {
                background-color: white;
                border: 2px solid #ddd;
                border-radius: 10px;
                padding: 10px;
            }
            QWidget:hover {
                border-color: #2196F3;
            }
            QWidget.selected {
                border-color: #4CAF50;
                background-color: #E8F5E8;
            }
        """)
        
        layout = QVBoxLayout(container)
        layout.setSpacing(5)
        
        # Locker icon
        icon_label = QLabel("🔒")
        icon_font = QFont()
        icon_font.setPointSize(32)
        icon_label.setFont(icon_font)
        icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_label)
        
        # Locker name
        name = locker.get("name", f"Locker {locker.get('id', '')}")
        name_label = QLabel(name)
        name_font = QFont()
        name_font.setPointSize(14)
        name_font.setBold(True)
        name_label.setFont(name_font)
        name_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        name_label.setWordWrap(True)
        layout.addWidget(name_label)
        
        # Locker status/info
        status_val = locker.get("status")
        status_text = status_val if isinstance(status_val, str) else getattr(status_val, 'value', None) or "unknown"
        status_label = QLabel(f"Status: {status_text}")
        status_font = QFont()
        status_font.setPointSize(10)
        status_label.setFont(status_font)
        status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        status_label.setStyleSheet("color: #666;")
        layout.addWidget(status_label)
        
        # Make clickable
        container.mousePressEvent = lambda event, l=locker, c=container: self.on_locker_clicked(l, c)
        
        return container
    
    def on_locker_clicked(self, locker: dict, container: QWidget):
        """Handle locker selection"""
        # Clear previous selection
        for i in range(self.lockers_layout.count()):
            widget = self.lockers_layout.itemAt(i).widget()
            if widget:
                widget.setStyleSheet(widget.styleSheet().replace("selected", ""))
        
        # Select current locker
        container.setStyleSheet(container.styleSheet() + " QWidget { border-color: #4CAF50; background-color: #E8F5E8; }")
        
        self.selected_locker = locker
        self.confirm_button.setEnabled(True)
        
        self.logger.info(f"Selected locker: {locker.get('name', 'Unknown')}")
    
    def on_confirm(self):
        """Handle confirm button click"""
        if not self.selected_locker:
            return
        
        # Store selected locker data
        self.locker_data = {
            "locker": self.selected_locker,
            "action_type": self.action_type
        }
        
        # Store in app manager if available
        if hasattr(self, 'app_manager') and self.app_manager:
            self.app_manager.store_locker_data(self.locker_data)
        
        # Navigate to confirmation screen
        self.navigate_to.emit("confirm_action")
    
    def show_error(self, message: str):
        """Show error message"""
        self.status_label.setText(message)
        self.progress_bar.setVisible(False)