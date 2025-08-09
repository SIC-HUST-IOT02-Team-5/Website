#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Done Screen (P7) - Action completed successfully
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QWidget
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
import logging
from datetime import datetime

class DoneScreen(BaseScreen):
    """Done screen - action completed successfully"""
    
    def __init__(self, config: Config, completion_data: dict = None, parent=None):
        super().__init__(config, parent)
        self.completion_data = completion_data or {}
        self.logger = logging.getLogger(__name__)
        
        self.setup_done_content()
        self.setup_auto_return_timer()
    
    def get_screen_title(self) -> str:
        return "Hoàn tất"
    
    def setup_done_content(self):
        """Setup done screen content"""
        # Success icon
        self.success_icon = QLabel("✅")
        icon_font = QFont()
        icon_font.setPointSize(96)
        self.success_icon.setFont(icon_font)
        self.success_icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.success_icon)
        
        # Success message
        action_type = self.completion_data.get("action_type", "unknown")
        if action_type == "borrow":
            message = "Mượn thiết bị thành công!"
        else:
            message = "Trả thiết bị thành công!"
        
        self.message_label = QLabel(message)
        message_font = QFont()
        message_font.setPointSize(28)
        message_font.setBold(True)
        self.message_label.setFont(message_font)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.message_label.setStyleSheet("color: #4CAF50;")
        self.content_layout.addWidget(self.message_label)
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Summary information
        self.setup_summary_info()
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Auto return message
        self.auto_return_label = QLabel("Tự động quay về màn hình chính sau 5 giây...")
        auto_return_font = QFont()
        auto_return_font.setPointSize(16)
        self.auto_return_label.setFont(auto_return_font)
        self.auto_return_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.auto_return_label.setStyleSheet("color: #666;")
        self.content_layout.addWidget(self.auto_return_label)
        
        # Action buttons
        self.setup_action_buttons()
    
    def setup_summary_info(self):
        """Setup summary information display"""
        locker = self.completion_data.get("locker", {})
        action_type = self.completion_data.get("action_type", "unknown")
        completion_time = self.completion_data.get("completion_time")
        duration = self.completion_data.get("duration", 0)
        
        # Create summary container
        summary_container = QWidget()
        summary_container.setStyleSheet("""
            QWidget {
                background-color: #E8F5E8;
                border: 2px solid #4CAF50;
                border-radius: 15px;
                padding: 20px;
            }
        """)
        
        summary_layout = QVBoxLayout(summary_container)
        summary_layout.setSpacing(12)
        
        # Summary title
        summary_title = QLabel("📋 Tóm tắt thao tác")
        title_font = QFont()
        title_font.setPointSize(20)
        title_font.setBold(True)
        summary_title.setFont(title_font)
        summary_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        summary_layout.addWidget(summary_title)
        
        # Locker information
        locker_name = locker.get("name", "Tủ khóa")
        locker_label = QLabel(f"📍 Tủ khóa: {locker_name}")
        self.style_summary_label(locker_label)
        summary_layout.addWidget(locker_label)
        
        # Compartment
        compartment = locker.get("compartment", "N/A")
        comp_label = QLabel(f"🔢 Ngăn số: {compartment}")
        self.style_summary_label(comp_label)
        summary_layout.addWidget(comp_label)
        
        # Action type
        if action_type == "borrow":
            action_text = "📦 Hành động: Mượn thiết bị"
        else:
            action_text = "🔄 Hành động: Trả thiết bị"
        
        action_label = QLabel(action_text)
        self.style_summary_label(action_label)
        summary_layout.addWidget(action_label)
        
        # Completion time
        if completion_time:
            try:
                dt = datetime.fromisoformat(completion_time.replace('Z', '+00:00'))
                formatted_time = dt.strftime("%H:%M:%S - %d/%m/%Y")
                time_label = QLabel(f"⏰ Thời gian: {formatted_time}")
                self.style_summary_label(time_label)
                summary_layout.addWidget(time_label)
            except:
                pass
        
        # Duration
        if duration > 0:
            minutes = duration // 60
            seconds = duration % 60
            duration_text = f"⏱️ Thời gian sử dụng: {minutes:02d}:{seconds:02d}"
            duration_label = QLabel(duration_text)
            self.style_summary_label(duration_label)
            summary_layout.addWidget(duration_label)
        
        self.content_layout.addWidget(summary_container)
    
    def style_summary_label(self, label: QLabel):
        """Style summary labels"""
        label_font = QFont()
        label_font.setPointSize(14)
        label.setFont(label_font)
        label.setAlignment(Qt.AlignmentFlag.AlignLeft)
        label.setStyleSheet("color: #333;")
    
    def setup_action_buttons(self):
        """Setup action buttons"""
        buttons_layout = QHBoxLayout()
        buttons_layout.setSpacing(20)
        
        # New action button
        self.new_action_button = QPushButton("🔄 Thao tác mới")
        self.new_action_button.setMinimumHeight(60)
        self.new_action_button.clicked.connect(self.on_new_action)
        self.style_button(self.new_action_button, "#2196F3")
        buttons_layout.addWidget(self.new_action_button)
        
        # Home button
        self.home_button = QPushButton("🏠 Về trang chủ")
        self.home_button.setMinimumHeight(60)
        self.home_button.clicked.connect(self.on_home)
        self.style_button(self.home_button, "#4CAF50")
        buttons_layout.addWidget(self.home_button)
        
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
        """)
    
    def setup_auto_return_timer(self):
        """Setup auto return timer"""
        self.auto_return_timer = QTimer()
        self.auto_return_timer.timeout.connect(self.auto_return_to_home)
        self.auto_return_timer.start(5000)  # 5 seconds
        
        # Countdown timer
        self.countdown_timer = QTimer()
        self.countdown_timer.timeout.connect(self.update_countdown)
        self.countdown_timer.start(1000)  # 1 second
        
        self.countdown_seconds = 5
    
    def update_countdown(self):
        """Update countdown display"""
        self.countdown_seconds -= 1
        
        if self.countdown_seconds <= 0:
            self.countdown_timer.stop()
            self.auto_return_label.setText("Đang chuyển về trang chủ...")
        else:
            self.auto_return_label.setText(f"Tự động quay về màn hình chính sau {self.countdown_seconds} giây...")
    
    def auto_return_to_home(self):
        """Auto return to home screen"""
        self.auto_return_timer.stop()
        self.navigate_to.emit("welcome")
    
    def on_new_action(self):
        """Handle new action button click"""
        # Stop auto return timer
        if hasattr(self, 'auto_return_timer'):
            self.auto_return_timer.stop()
        if hasattr(self, 'countdown_timer'):
            self.countdown_timer.stop()
        
        # Navigate to action selection
        self.navigate_to.emit("action_select")
    
    def on_home(self):
        """Handle home button click"""
        # Stop auto return timer
        if hasattr(self, 'auto_return_timer'):
            self.auto_return_timer.stop()
        if hasattr(self, 'countdown_timer'):
            self.countdown_timer.stop()
        
        # Navigate to welcome screen
        self.navigate_to.emit("welcome")
    
    def closeEvent(self, event):
        """Handle close event"""
        # Stop timers
        if hasattr(self, 'auto_return_timer'):
            self.auto_return_timer.stop()
        if hasattr(self, 'countdown_timer'):
            self.countdown_timer.stop()
        
        super().closeEvent(event) 