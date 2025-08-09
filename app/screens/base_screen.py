#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Base screen class for all application screens
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPalette, QColor
from utils.config import Config

class BaseScreen(QWidget):
    """Base class for all application screens"""
    
    # Signals for navigation
    navigate_to = pyqtSignal(str)  # Signal to navigate to another screen
    go_back = pyqtSignal()  # Signal to go back to previous screen
    
    def __init__(self, config: Config, parent=None):
        super().__init__(parent)
        self.config = config
        self.setup_ui()
        self.setup_styles()
    
    def setup_ui(self):
        """Setup basic UI layout"""
        # Main layout
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(20, 20, 20, 20)
        self.main_layout.setSpacing(20)
        
        # Header
        self.setup_header()
        
        # Content area
        self.content_layout = QVBoxLayout()
        self.content_layout.setSpacing(15)
        self.main_layout.addLayout(self.content_layout)
        
        # Footer
        self.setup_footer()
        
        # Set fullscreen if configured
        if self.config.get("ui.fullscreen", True):
            self.setWindowState(Qt.WindowState.WindowFullScreen)
    
    def setup_header(self):
        """Setup header with title and clock"""
        header_layout = QHBoxLayout()
        
        # Title
        self.title_label = QLabel(self.get_screen_title())
        self.title_label.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        header_layout.addWidget(self.title_label)
        
        # Clock
        self.clock_label = QLabel()
        self.clock_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        header_layout.addWidget(self.clock_label)
        
        self.main_layout.addLayout(header_layout)
        
        # Update clock
        self.update_clock()
    
    def setup_footer(self):
        """Setup footer with navigation buttons"""
        footer_layout = QHBoxLayout()
        
        # Back button
        self.back_button = QPushButton("← Quay lại")
        self.back_button.clicked.connect(self.on_back_clicked)
        footer_layout.addWidget(self.back_button)
        
        # Spacer
        footer_layout.addStretch()
        
        # Home button
        self.home_button = QPushButton("🏠 Trang chủ")
        self.home_button.clicked.connect(self.on_home_clicked)
        footer_layout.addWidget(self.home_button)
        
        self.main_layout.addLayout(footer_layout)
    
    def setup_styles(self):
        """Setup screen styles"""
        # Set background color
        palette = self.palette()
        palette.setColor(QPalette.ColorRole.Window, QColor(240, 240, 240))
        self.setPalette(palette)
        self.setAutoFillBackground(True)
        
        # Set fonts
        title_font = QFont()
        title_font.setPointSize(24)
        title_font.setBold(True)
        self.title_label.setFont(title_font)
        
        clock_font = QFont()
        clock_font.setPointSize(18)
        self.clock_label.setFont(clock_font)
        
        button_font = QFont()
        button_font.setPointSize(14)
        self.back_button.setFont(button_font)
        self.home_button.setFont(button_font)
    
    def get_screen_title(self) -> str:
        """Get screen title - override in subclasses"""
        return "Màn hình"
    
    def update_clock(self):
        """Update clock display"""
        from datetime import datetime
        current_time = datetime.now().strftime("%H:%M:%S")
        self.clock_label.setText(current_time)
    
    def on_back_clicked(self):
        """Handle back button click"""
        self.go_back.emit()
    
    def on_home_clicked(self):
        """Handle home button click"""
        self.navigate_to.emit("welcome")
    
    def showEvent(self, event):
        """Handle show event"""
        super().showEvent(event)
        # Update clock when screen is shown
        self.update_clock()
    
    def keyPressEvent(self, event):
        """Handle key press events"""
        if event.key() == Qt.Key.Key_Escape:
            self.on_back_clicked()
        elif event.key() == Qt.Key.Key_Home:
            self.on_home_clicked()
        else:
            super().keyPressEvent(event) 