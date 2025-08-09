#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RFID reader module for USB/UART communication
"""

import serial
import threading
import time
import logging
from typing import Optional, Callable
from utils.config import Config

class RFIDReader:
    """RFID reader class for USB/UART communication"""
    
    def __init__(self, config: Config, callback: Optional[Callable[[str], None]] = None):
        self.config = config
        self.callback = callback
        self.serial_port = None
        self.is_reading = False
        self.reader_thread = None
        self.logger = logging.getLogger(__name__)
        
        # Configuration
        self.port = config.get("rfid.port", "/dev/ttyUSB0")
        self.baudrate = config.get("rfid.baudrate", 9600)
        self.timeout = config.get("rfid.timeout", 1)
        self.demo_mode = config.get("rfid.demo_mode", False)
    
    def connect(self) -> bool:
        """Connect to RFID reader"""
        # If in demo mode, don't try to connect to hardware
        if self.demo_mode:
            self.logger.info("RFID reader in demo mode - skipping hardware connection")
            return True
            
        try:
            self.serial_port = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE
            )
            
            if self.serial_port.is_open:
                self.logger.info(f"Connected to RFID reader on {self.port}")
                return True
            else:
                self.logger.error(f"Failed to open serial port {self.port}")
                return False
                
        except serial.SerialException as e:
            self.logger.error(f"Serial connection error: {e}")
            return False
        except Exception as e:
            self.logger.error(f"Unexpected error connecting to RFID reader: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from RFID reader"""
        self.stop_reading()
        
        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
            self.logger.info("Disconnected from RFID reader")
    
    def start_reading(self):
        """Start reading RFID cards in background thread"""
        # If in demo mode, don't start hardware reading
        if self.demo_mode:
            self.logger.info("RFID reader in demo mode - skipping hardware reading")
            return True
            
        if not self.serial_port or not self.serial_port.is_open:
            if not self.connect():
                self.logger.warning("Failed to start RFID reading")
                return False
        
        if self.is_reading:
            return True
        
        self.is_reading = True
        self.reader_thread = threading.Thread(target=self._read_loop, daemon=True)
        self.reader_thread.start()
        self.logger.info("Started RFID reading")
        return True
    
    def stop_reading(self):
        """Stop reading RFID cards"""
        self.is_reading = False
        
        if self.reader_thread and self.reader_thread.is_alive():
            self.reader_thread.join(timeout=1)
        
        self.logger.info("Stopped RFID reading")
    
    def _read_loop(self):
        """Background thread for reading RFID cards"""
        while self.is_reading:
            try:
                if self.serial_port.in_waiting > 0:
                    # Read data from serial port
                    data = self.serial_port.readline().decode('utf-8').strip()
                    
                    if data:
                        # Parse RFID UID (assuming format like "UID: 1234567890ABCDEF")
                        uid = self._parse_rfid_data(data)
                        if uid and self.callback:
                            self.logger.info(f"RFID card detected: {uid}")
                            self.callback(uid)
                            
            except Exception as e:
                self.logger.error(f"Error reading RFID data: {e}")
                time.sleep(0.1)
    
    def _parse_rfid_data(self, data: str) -> Optional[str]:
        """Parse RFID data to extract UID"""
        try:
            # Remove whitespace and common prefixes
            data = data.strip()
            
            # Handle different RFID reader formats
            if data.startswith("UID:"):
                return data[4:].strip()
            elif data.startswith("Card UID:"):
                return data[9:].strip()
            elif len(data) >= 8:  # Assume it's a raw UID
                return data
            else:
                return None
                
        except Exception as e:
            self.logger.error(f"Error parsing RFID data '{data}': {e}")
            return None
    
    def read_single_card(self, timeout: float = 10.0) -> Optional[str]:
        """Read a single RFID card with timeout"""
        if self.demo_mode:
            self.logger.info("RFID reader in demo mode - returning demo card")
            return "DEMO_CARD_12345"
            
        if not self.serial_port or not self.serial_port.is_open:
            if not self.connect():
                return None
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                if self.serial_port.in_waiting > 0:
                    data = self.serial_port.readline().decode('utf-8').strip()
                    if data:
                        uid = self._parse_rfid_data(data)
                        if uid:
                            return uid
                            
            except Exception as e:
                self.logger.error(f"Error reading single card: {e}")
                
            time.sleep(0.1)
        
        return None
    
    def is_connected(self) -> bool:
        """Check if RFID reader is connected"""
        if self.demo_mode:
            return True
        return self.serial_port is not None and self.serial_port.is_open 