#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ứng dụng quản lý tủ khóa thông minh
Main application entry point
"""

import sys
import os
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon
from app_manager import AppManager
from utils.config import Config
from utils.logger import setup_logger

class MainWindow(QMainWindow):
    """Main application window"""
    
    def __init__(self, config: Config):
        super().__init__()
        self.config = config
        self.setup_window()
        self.setup_app_manager()
    
    def setup_window(self):
        """Setup main window"""
        self.setWindowTitle("Smart Locker Management System")
        self.setWindowState(Qt.WindowState.WindowFullScreen)
        
        # Set window icon if available
        icon_path = os.path.join(os.path.dirname(__file__), "assets", "icon.png")
        if os.path.exists(icon_path):
            self.setWindowIcon(QIcon(icon_path))
    
    def setup_app_manager(self):
        """Setup application manager"""
        self.app_manager = AppManager(self.config)
        self.setCentralWidget(self.app_manager.get_stacked_widget())

def main():
    """Main function to start the application"""
    # Setup logging
    logger = setup_logger()
    logger.info("Starting Locker Management Application")
    
    # Create Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("Locker Management System")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("Smart Locker")
    
    # Load configuration
    config = Config()
    
    # Create and show main window
    main_window = MainWindow(config)
    main_window.show()
    
    # Start application event loop
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 