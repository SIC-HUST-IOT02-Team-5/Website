#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Countdown Screen (P6) - Monitor action and countdown timer
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QProgressBar, QWidget
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.api_client import APIClient
import logging
from datetime import datetime, timedelta

class CountdownScreen(BaseScreen):
    """Countdown screen for monitoring action"""
    
    def __init__(self, config: Config, user_data: dict = None, action_data: dict = None, parent=None):
        # Initialize data before calling super().__init__ to avoid AttributeError
        self.user_data = user_data or {}
        self.action_data = action_data or {}
        
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.logger = logging.getLogger(__name__)
        
        # Countdown settings
        self.countdown_time = config.get("ui.countdown_time", 300)  # 5 minutes default
        self.remaining_time = self.countdown_time
        self.is_warning = False
        
        # Setup UI
        self.setup_countdown_content()
        self.setup_timers()
    
    def get_screen_title(self) -> str:
        action_type = self.action_data.get("action_type", "unknown")
        if action_type == "borrow":
            return "Đang mượn thiết bị"
        else:
            return "Đang trả thiết bị"
    
    def setup_countdown_content(self):
        """Setup countdown content"""
        # Main message
        action_type = self.action_data.get("action_type", "unknown")
        if action_type == "borrow":
            message = "Tủ khóa đã mở - Vui lòng lấy thiết bị"
        else:
            message = "Tủ khóa đã mở - Vui lòng đặt thiết bị vào"
        
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
        
        # Countdown timer
        self.setup_countdown_timer()
        
        # Add spacing
        self.content_layout.addStretch()
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, self.countdown_time)
        self.progress_bar.setValue(self.countdown_time)
        self.progress_bar.setFormat("Thời gian còn lại: %v giây")
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #ddd;
                border-radius: 10px;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background-color: #4CAF50;
                border-radius: 8px;
            }
        """)
        self.content_layout.addWidget(self.progress_bar)
        
        # Status message
        self.status_label = QLabel("Tủ khóa đang mở - Thực hiện thao tác của bạn")
        status_font = QFont()
        status_font.setPointSize(16)
        self.status_label.setFont(status_font)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)
        
        # Action buttons
        self.setup_action_buttons()
    
    def setup_locker_info(self):
        """Setup locker information display"""
        locker = self.action_data.get("locker", {})
        action_type = self.action_data.get("action_type", "unknown")
        
        # Create info container
        info_container = QWidget()
        info_container.setStyleSheet("""
            QWidget {
                background-color: #E8F5E8;
                border: 2px solid #4CAF50;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        
        info_layout = QVBoxLayout(info_container)
        info_layout.setSpacing(8)
        
        # Locker name
        locker_name = locker.get("name", "Tủ khóa")
        name_label = QLabel(f"📍 {locker_name}")
        name_font = QFont()
        name_font.setPointSize(18)
        name_font.setBold(True)
        name_label.setFont(name_font)
        info_layout.addWidget(name_label)
        
        # Compartment number
        compartment = locker.get("compartment", "N/A")
        comp_label = QLabel(f"🔢 Ngăn số: {compartment}")
        comp_font = QFont()
        comp_font.setPointSize(16)
        comp_label.setFont(comp_font)
        info_layout.addWidget(comp_label)
        
        # Action type
        if action_type == "borrow":
            action_text = "📦 Đang mượn thiết bị"
        else:
            action_text = "🔄 Đang trả thiết bị"
        
        action_label = QLabel(action_text)
        action_font = QFont()
        action_font.setPointSize(16)
        action_font.setBold(True)
        action_label.setFont(action_font)
        info_layout.addWidget(action_label)
        
        self.content_layout.addWidget(info_container)
    
    def setup_countdown_timer(self):
        """Setup countdown timer display"""
        # Timer container
        timer_container = QWidget()
        timer_container.setStyleSheet("""
            QWidget {
                background-color: #f0f0f0;
                border: 3px solid #2196F3;
                border-radius: 15px;
                padding: 20px;
            }
        """)
        
        timer_layout = QVBoxLayout(timer_container)
        timer_layout.setSpacing(10)
        
        # Timer label
        self.timer_label = QLabel("05:00")
        timer_font = QFont()
        timer_font.setPointSize(48)
        timer_font.setBold(True)
        self.timer_label.setFont(timer_font)
        self.timer_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.timer_label.setStyleSheet("color: #2196F3;")
        timer_layout.addWidget(self.timer_label)
        
        # Timer description
        desc_label = QLabel("Thời gian còn lại")
        desc_font = QFont()
        desc_font.setPointSize(16)
        desc_label.setFont(desc_font)
        desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        desc_label.setStyleSheet("color: #666;")
        timer_layout.addWidget(desc_label)
        
        self.content_layout.addWidget(timer_container)
    
    def setup_action_buttons(self):
        """Setup action buttons"""
        buttons_layout = QHBoxLayout()
        buttons_layout.setSpacing(20)
        
        # Complete button
        self.complete_button = QPushButton("✅ Hoàn tất")
        self.complete_button.setMinimumHeight(60)
        self.complete_button.clicked.connect(self.on_complete)
        self.style_button(self.complete_button, "#4CAF50")
        buttons_layout.addWidget(self.complete_button)
        
        # Cancel button
        self.cancel_button = QPushButton("❌ Hủy bỏ")
        self.cancel_button.setMinimumHeight(60)
        self.cancel_button.clicked.connect(self.on_cancel)
        self.style_button(self.cancel_button, "#F44336")
        buttons_layout.addWidget(self.cancel_button)
        
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
    
    def setup_timers(self):
        """Setup countdown and status check timers"""
        # Countdown timer
        self.countdown_timer = QTimer()
        self.countdown_timer.timeout.connect(self.update_countdown)
        self.countdown_timer.start(1000)  # Update every second
        
        # Status check timer
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.check_locker_status)
        self.status_timer.start(5000)  # Check every 5 seconds
    
    def update_countdown(self):
        """Update countdown timer"""
        self.remaining_time -= 1
        
        if self.remaining_time <= 0:
            # Time's up
            self.countdown_timer.stop()
            self.status_timer.stop()
            self.time_expired()
            return
        
        # Update timer display
        minutes = self.remaining_time // 60
        seconds = self.remaining_time % 60
        self.timer_label.setText(f"{minutes:02d}:{seconds:02d}")
        
        # Update progress bar
        self.progress_bar.setValue(self.remaining_time)
        
        # Check for warning
        if self.remaining_time <= 60 and not self.is_warning:  # 1 minute warning
            self.show_warning()
    
    def show_warning(self):
        """Show warning when time is running out"""
        self.is_warning = True
        
        # Change colors to warning
        self.timer_label.setStyleSheet("color: #FF9800;")
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #FF9800;
                border-radius: 10px;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background-color: #FF9800;
                border-radius: 8px;
            }
        """)
        
        self.status_label.setText("⚠️ Cảnh báo: Thời gian sắp hết!")
        self.status_label.setStyleSheet("color: #FF9800; font-weight: bold;")
    
    def time_expired(self):
        """Handle time expiration"""
        self.timer_label.setText("00:00")
        self.timer_label.setStyleSheet("color: #F44336;")
        self.progress_bar.setValue(0)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #F44336;
                border-radius: 10px;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background-color: #F44336;
                border-radius: 8px;
            }
        """)
        
        self.status_label.setText("⏰ Hết thời gian! Tủ khóa sẽ tự động đóng")
        self.status_label.setStyleSheet("color: #F44336; font-weight: bold;")
        
        # Disable complete button
        self.complete_button.setEnabled(False)
        
        # Auto-complete after delay
        QTimer.singleShot(3000, self.auto_complete)
    
    def check_locker_status(self):
        """Check locker status from API"""
        try:
            token = self.user_data.get("token")
            locker = self.action_data.get("locker", {})
            locker_id = locker.get("id")
            
            if not token or not locker_id:
                return
            
            # Call API to check status
            response = self.api_client.get_locker_status(token, locker_id)
            
            if response and response.get("success"):
                status = response.get("status")
                if status == "closed":
                    # Locker was closed, complete action
                    self.logger.info("Locker was closed, completing action")
                    self.complete_action()
                    
        except Exception as e:
            self.logger.error(f"Error checking locker status: {e}")
    
    def on_complete(self):
        """Handle complete button click"""
        self.complete_action()
    
    def complete_action(self):
        """Complete the action"""
        try:
            token = self.user_data.get("token")
            locker = self.action_data.get("locker", {})
            action_type = self.action_data.get("action_type", "unknown")
            locker_id = locker.get("id")
            
            if not token or not locker_id:
                self.show_error("❌ Dữ liệu không hợp lệ")
                return
            
            # Call API to confirm action
            response = self.api_client.confirm_action(token, locker_id, action_type)
            
            if response and response.get("success"):
                # Action completed successfully
                self.logger.info(f"Action {action_type} completed for locker {locker_id}")
                
                # Store completion data
                self.completion_data = {
                    "locker": locker,
                    "action_type": action_type,
                    "completion_time": datetime.now().isoformat(),
                    "duration": self.countdown_time - self.remaining_time
                }
                
                # Store in app manager if available
                if hasattr(self, 'app_manager'):
                    self.app_manager.store_completion_data(self.completion_data)
                
                # Navigate to done screen
                self.navigate_to.emit("done")
                
            else:
                error_msg = response.get("message", "Lỗi hoàn tất") if response else "Lỗi kết nối"
                self.show_error(f"❌ {error_msg}")
                
        except Exception as e:
            self.logger.error(f"Error completing action: {e}")
            self.show_error("❌ Lỗi hệ thống")
    
    def auto_complete(self):
        """Auto-complete action when time expires"""
        self.complete_action()
    
    def show_error(self, message: str):
        """Show error message"""
        self.status_label.setText(message)
        self.status_label.setStyleSheet("color: #F44336; font-weight: bold;")
    
    def on_cancel(self):
        """Handle cancel button click"""
        # Stop timers
        if hasattr(self, 'countdown_timer'):
            self.countdown_timer.stop()
        if hasattr(self, 'status_timer'):
            self.status_timer.stop()
        
        self.go_back.emit()
    
    def closeEvent(self, event):
        """Handle close event"""
        # Stop timers
        if hasattr(self, 'countdown_timer'):
            self.countdown_timer.stop()
        if hasattr(self, 'status_timer'):
            self.status_timer.stop()
        
        super().closeEvent(event) 