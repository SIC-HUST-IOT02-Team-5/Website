#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
User/Password Login Screen - Replace RFID and JWT code login
"""

from PyQt6.QtWidgets import QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QLineEdit, QProgressBar, QWidget
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
from screens.base_screen import BaseScreen
from utils.config import Config
from utils.api_client import APIClient
import logging

class UserLoginScreen(BaseScreen):
    """Username/password login screen"""

    def __init__(self, config: Config, parent=None):
        super().__init__(config, parent)
        self.api_client = APIClient(config)
        self.logger = logging.getLogger(__name__)
        self.username_input: QLineEdit | None = None
        self.password_input: QLineEdit | None = None
        self.status_label: QLabel | None = None
        self.progress_bar: QProgressBar | None = None
        self.setup_login_content()

    def get_screen_title(self) -> str:
        return "Account Login"

    def setup_login_content(self):
        """Setup login form UI"""
        # Title message
        message_label = QLabel("Please enter your username and password")
        message_font = QFont()
        message_font.setPointSize(22)
        message_font.setBold(True)
        message_label.setFont(message_font)
        message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(message_label)

        # Form container
        form_container = QWidget()
        form_layout = QVBoxLayout(form_container)
        form_layout.setSpacing(12)

        # Username
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        uf = QFont(); uf.setPointSize(16)
        self.username_input.setFont(uf)
        self.username_input.setMinimumHeight(48)
        form_layout.addWidget(self.username_input)

        # Password
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        pf = QFont(); pf.setPointSize(16)
        self.password_input.setFont(pf)
        self.password_input.setMinimumHeight(48)
        form_layout.addWidget(self.password_input)

        self.content_layout.addWidget(form_container)

        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)
        self.content_layout.addWidget(self.progress_bar)

        # Status
        self.status_label = QLabel("")
        sf = QFont(); sf.setPointSize(14)
        self.status_label.setFont(sf)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.content_layout.addWidget(self.status_label)

        # Buttons
        buttons = QHBoxLayout()
        buttons.setSpacing(12)

        self.login_button = QPushButton("🔐 Login")
        self.login_button.setMinimumHeight(56)
        self.login_button.clicked.connect(self.on_login_clicked)
        self.style_button(self.login_button, "#4CAF50")
        buttons.addWidget(self.login_button)

        self.clear_button = QPushButton("🧹 Clear")
        self.clear_button.setMinimumHeight(56)
        self.clear_button.clicked.connect(self.on_clear_clicked)
        self.style_button(self.clear_button, "#9E9E9E")
        buttons.addWidget(self.clear_button)

        self.content_layout.addLayout(buttons)

    def style_button(self, button: QPushButton, color: str):
        btn_font = QFont(); btn_font.setPointSize(16); btn_font.setBold(True)
        button.setFont(btn_font)
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

    def on_clear_clicked(self):
        if self.username_input:
            self.username_input.clear()
        if self.password_input:
            self.password_input.clear()
        if self.status_label:
            self.status_label.setText("")

    def on_login_clicked(self):
        username = self.username_input.text().strip() if self.username_input else ""
        password = self.password_input.text() if self.password_input else ""
        if not username or not password:
            if self.status_label:
                self.status_label.setText("❌ Please enter username and password")
            return

        # Disable inputs
        self.login_button.setEnabled(False)
        self.clear_button.setEnabled(False)
        if self.progress_bar:
            self.progress_bar.setVisible(True)
        if self.status_label:
            self.status_label.setText("Authenticating...")

        self.authenticate(username, password)

    def authenticate(self, username: str, password: str):
        try:
            resp = self.api_client.login(username, password)
            if not resp:
                self.show_error("Cannot connect to server")
                return

            # Backend returns user info with tokens in one dict
            access_token = resp.get("access_token")
            refresh_token = resp.get("refresh_token")

            if access_token is None:
                # Maybe wrapped differently
                # Try nested structure
                data = resp.get("data") if isinstance(resp, dict) else None
                if data:
                    access_token = data.get("access_token")
                    refresh_token = data.get("refresh_token")
                    resp = data

            if access_token:
                user_info = {
                    "id": resp.get("id"),
                    "username": resp.get("username"),
                    "full_name": resp.get("full_name"),
                    "role": resp.get("role"),
                }
                self.user_data = {
                    "token": access_token,
                    "refresh_token": refresh_token,
                    "user_info": user_info,
                }
                # Store in app manager
                if hasattr(self, 'app_manager'):
                    self.app_manager.store_user_data(self.user_data)
                # Navigate to next screen
                self.navigate_to.emit("action_select")
            else:
                self.show_error(resp.get("error") or "Login failed")
        except Exception as e:
            self.logger.exception("Login error")
            self.show_error("System error")
        finally:
            # Re-enable
            self.login_button.setEnabled(True)
            self.clear_button.setEnabled(True)
            if self.progress_bar:
                self.progress_bar.setVisible(False)

    def show_error(self, message: str):
        if self.status_label:
            self.status_label.setText(f"❌ {message}")
