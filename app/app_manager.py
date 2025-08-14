#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Application Manager - Manages navigation between screens
"""

from PyQt6.QtWidgets import QStackedWidget, QWidget
from PyQt6.QtCore import QObject, pyqtSignal
from screens.welcome_screen import WelcomeScreen
from screens.rfid_login_screen import RFIDLoginScreen
from screens.code_login_screen import CodeLoginScreen
from screens.action_select_screen import ActionSelectScreen
from screens.locker_select_screen import LockerSelectScreen
from screens.confirm_action_screen import ConfirmActionScreen
from screens.countdown_screen import CountdownScreen
from screens.done_screen import DoneScreen
from utils.config import Config
import logging

class AppManager(QObject):
    """Application manager for screen navigation"""
    
    def __init__(self, config: Config, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Screen data storage
        self.user_data = {}
        self.locker_data = {}
        self.action_data = {}
        self.completion_data = {}
        
        # Create stacked widget
        self.stacked_widget = QStackedWidget()
        
        # Initialize screens
        self.setup_screens()
        self.connect_signals()
        
        # Start with welcome screen
        self.show_screen("welcome")
    
    def setup_screens(self):
        """Setup all application screens"""
        # Welcome Screen (P0)
        self.welcome_screen = WelcomeScreen(self.config)
        self.welcome_screen.app_manager = self
        self.stacked_widget.addWidget(self.welcome_screen)
        
        # RFID Login Screen (P1)
        self.rfid_login_screen = RFIDLoginScreen(self.config)
        self.rfid_login_screen.app_manager = self
        self.stacked_widget.addWidget(self.rfid_login_screen)
        
        # Code Login Screen (P2)
        self.code_login_screen = CodeLoginScreen(self.config)
        self.code_login_screen.app_manager = self
        self.stacked_widget.addWidget(self.code_login_screen)
        
        # Action Select Screen (P3)
        self.action_select_screen = ActionSelectScreen(self.config)
        self.action_select_screen.app_manager = self
        self.stacked_widget.addWidget(self.action_select_screen)
        
        # Locker Select Screens (P4a/P4b) - will be created dynamically
        self.locker_select_borrow_screen = None
        self.locker_select_return_screen = None
        
        # Confirm Action Screen (P5)
        self.confirm_action_screen = ConfirmActionScreen(self.config)
        self.confirm_action_screen.app_manager = self
        self.stacked_widget.addWidget(self.confirm_action_screen)
        
        # Countdown Screen (P6)
        self.countdown_screen = CountdownScreen(self.config)
        self.countdown_screen.app_manager = self
        self.stacked_widget.addWidget(self.countdown_screen)
        
        # Done Screen (P7)
        self.done_screen = DoneScreen(self.config)
        self.done_screen.app_manager = self
        self.stacked_widget.addWidget(self.done_screen)
    
    def connect_signals(self):
        """Connect navigation signals between screens"""
        # Welcome Screen signals
        self.welcome_screen.navigate_to.connect(self.handle_navigation)
        
        # RFID Login Screen signals
        self.rfid_login_screen.navigate_to.connect(self.handle_navigation)
        self.rfid_login_screen.go_back.connect(self.handle_go_back)
        
        # Code Login Screen signals
        self.code_login_screen.navigate_to.connect(self.handle_navigation)
        self.code_login_screen.go_back.connect(self.handle_go_back)
        
        # Action Select Screen signals
        self.action_select_screen.navigate_to.connect(self.handle_navigation)
        self.action_select_screen.go_back.connect(self.handle_go_back)
        
        # Confirm Action Screen signals
        self.confirm_action_screen.navigate_to.connect(self.handle_navigation)
        self.confirm_action_screen.go_back.connect(self.handle_go_back)
        
        # Countdown Screen signals
        self.countdown_screen.navigate_to.connect(self.handle_navigation)
        self.countdown_screen.go_back.connect(self.handle_go_back)
        
        # Done Screen signals
        self.done_screen.navigate_to.connect(self.handle_navigation)
    
    def handle_navigation(self, screen_name: str):
        """Handle navigation to different screens"""
        self.logger.info(f"Navigating to: {screen_name}")
        
        if screen_name == "welcome":
            self.show_welcome_screen()
        elif screen_name == "rfid_login":
            self.show_rfid_login_screen()
        elif screen_name == "code_login":
            self.show_code_login_screen()
        elif screen_name == "action_select":
            self.show_action_select_screen()
        elif screen_name == "locker_select_borrow":
            self.show_locker_select_screen("borrow")
        elif screen_name == "locker_select_return":
            self.show_locker_select_screen("return")
        elif screen_name == "confirm_action":
            self.show_confirm_action_screen()
        elif screen_name == "countdown":
            self.show_countdown_screen()
        elif screen_name == "done":
            self.show_done_screen()
        else:
            self.logger.warning(f"Unknown screen: {screen_name}")
    
    def handle_go_back(self):
        """Handle go back navigation"""
        current_index = self.stacked_widget.currentIndex()
        current_widget = self.stacked_widget.currentWidget()
        
        # Determine previous screen based on current screen
        if isinstance(current_widget, RFIDLoginScreen):
            self.show_welcome_screen()
        elif isinstance(current_widget, CodeLoginScreen):
            self.show_welcome_screen()
        elif isinstance(current_widget, ActionSelectScreen):
            self.show_welcome_screen()
        elif isinstance(current_widget, LockerSelectScreen):
            self.show_action_select_screen()
        elif isinstance(current_widget, ConfirmActionScreen):
            # Go back to appropriate locker select screen
            action_type = self.locker_data.get("action_type", "borrow")
            if action_type == "borrow":
                self.show_locker_select_screen("borrow")
            else:
                self.show_locker_select_screen("return")
        elif isinstance(current_widget, CountdownScreen):
            self.show_confirm_action_screen()
        else:
            # Default: go to welcome
            self.show_welcome_screen()
    
    def show_screen(self, screen_name: str):
        """Show screen by name"""
        self.handle_navigation(screen_name)
    
    def show_welcome_screen(self):
        """Show welcome screen"""
        self.stacked_widget.setCurrentWidget(self.welcome_screen)
        # Clear all data when returning to welcome
        self.clear_all_data()
    
    def show_rfid_login_screen(self):
        """Show RFID login screen"""
        self.stacked_widget.setCurrentWidget(self.rfid_login_screen)
    
    def show_code_login_screen(self):
        """Show code login screen"""
        self.stacked_widget.setCurrentWidget(self.code_login_screen)
    
    def show_action_select_screen(self):
        """Show action select screen"""
        # Pass user data to action select screen
        self.action_select_screen.user_data = self.user_data
        self.stacked_widget.setCurrentWidget(self.action_select_screen)
    
    def show_locker_select_screen(self, action_type: str):
        """Show locker select screen"""
        # Create screen if not exists
        if action_type == "borrow":
            if not self.locker_select_borrow_screen:
                self.locker_select_borrow_screen = LockerSelectScreen(
                    self.config, self.user_data, "borrow"
                )
                self.locker_select_borrow_screen.app_manager = self
                self.locker_select_borrow_screen.navigate_to.connect(self.handle_navigation)
                self.locker_select_borrow_screen.go_back.connect(self.handle_go_back)
                self.stacked_widget.addWidget(self.locker_select_borrow_screen)
            
            self.stacked_widget.setCurrentWidget(self.locker_select_borrow_screen)
        else:
            if not self.locker_select_return_screen:
                self.locker_select_return_screen = LockerSelectScreen(
                    self.config, self.user_data, "return"
                )
                self.locker_select_return_screen.app_manager = self
                self.locker_select_return_screen.navigate_to.connect(self.handle_navigation)
                self.locker_select_return_screen.go_back.connect(self.handle_go_back)
                self.stacked_widget.addWidget(self.locker_select_return_screen)
            
            self.stacked_widget.setCurrentWidget(self.locker_select_return_screen)
    
    def show_confirm_action_screen(self):
        """Show confirm action screen"""
        # Pass data to confirm action screen
        self.confirm_action_screen.user_data = self.user_data
        self.confirm_action_screen.locker_data = self.locker_data
        self.stacked_widget.setCurrentWidget(self.confirm_action_screen)
    
    def show_countdown_screen(self):
        """Show countdown screen"""
        # Pass data to countdown screen
        self.countdown_screen.user_data = self.user_data
        self.countdown_screen.action_data = self.action_data
        self.stacked_widget.setCurrentWidget(self.countdown_screen)
    
    def show_done_screen(self):
        """Show done screen"""
        # Pass completion data to done screen
        self.done_screen.completion_data = self.completion_data
        self.stacked_widget.setCurrentWidget(self.done_screen)
    
    def store_user_data(self, user_data: dict):
        """Store user data from login"""
        self.user_data = user_data
        self.logger.info(f"Stored user data for: {user_data.get('user_info', {}).get('name', 'Unknown')}")
    
    def store_locker_data(self, locker_data: dict):
        """Store locker data from selection"""
        self.locker_data = locker_data
        self.logger.info(f"Stored locker data: {locker_data.get('locker', {}).get('name', 'Unknown')}")
    
    def store_action_data(self, action_data: dict):
        """Store action data from confirmation"""
        self.action_data = action_data
        self.logger.info(f"Stored action data: {action_data.get('action_type', 'Unknown')}")
    
    def store_completion_data(self, completion_data: dict):
        """Store completion data from countdown"""
        self.completion_data = completion_data
        self.logger.info(f"Stored completion data: {completion_data.get('action_type', 'Unknown')}")
    
    def clear_all_data(self):
        """Clear all stored data"""
        self.user_data = {}
        self.locker_data = {}
        self.action_data = {}
        self.completion_data = {}
        self.logger.info("Cleared all stored data")
    
    def get_current_widget(self) -> QWidget:
        """Get current widget"""
        return self.stacked_widget.currentWidget()
    
    def get_stacked_widget(self) -> QStackedWidget:
        """Get the stacked widget"""
        return self.stacked_widget 