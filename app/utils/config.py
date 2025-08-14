#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration management for the application
"""

import json
import os
from typing import Dict, Any

class Config:
    """Configuration class for application settings"""
    
    def __init__(self, config_file: str = "config.json"):
        self.config_file = config_file
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or create default"""
        default_config = {
            "api": {
                "base_url": "http://localhost:8000",
                "timeout": 30,
                "retry_attempts": 3
            },
            "rfid": {
                "port": "/dev/ttyUSB0",
                "baudrate": 9600,
                "timeout": 1
            },
            "ui": {
                "theme": "light",
                "language": "vi",
                "fullscreen": True,
                "countdown_time": 300  # 5 minutes in seconds
            },
            "locker": {
                "max_borrow_time": 3600,  # 1 hour in seconds
                "warning_time": 300  # 5 minutes warning
            }
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    # Merge with defaults
                    self._merge_config(default_config, loaded_config)
            except Exception as e:
                print(f"Error loading config: {e}")
        
        return default_config
    
    def _merge_config(self, default: Dict, loaded: Dict):
        """Recursively merge loaded config with defaults"""
        for key, value in loaded.items():
            if key in default and isinstance(default[key], dict) and isinstance(value, dict):
                self._merge_config(default[key], value)
            else:
                default[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by dot notation key"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """Set configuration value by dot notation key"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
    
    def save(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving config: {e}") 