import os
import json
import logging
from typing import Dict, Any, Optional
import paho.mqtt.client as mqtt
from app.extensions import db
from app.models.cell_model import CellModel, CellStatus
from app.models.cell_event_model import CellEventModel, LockerEventType
from datetime import datetime
from app.utils.timezone_helper import get_vn_utc_now

logger = logging.getLogger(__name__)

class MQTTService:
    def __init__(self):
        self.client = None
        self.app = None  # Store Flask app instance
        self.broker_host = os.getenv('MQTT_BROKER_HOST', 'localhost')
        self.broker_port = int(os.getenv('MQTT_BROKER_PORT', 1883))
        self.username = os.getenv('MQTT_USERNAME', '')
        self.password = os.getenv('MQTT_PASSWORD', '')
        self.keepalive = int(os.getenv('MQTT_KEEPALIVE', 60))
        self.connected = False
        
    def on_connect(self, client, userdata, flags, rc):
        """Callback khi kết nối MQTT broker"""
        if rc == 0:
            self.connected = True
            logger.info(f"Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
            
            # Subscribe các topic quan trọng
            self.subscribe_topics()
        else:
            self.connected = False
            logger.error(f"Failed to connect to MQTT broker. Code: {rc}")
    
    def on_disconnect(self, client, userdata, rc):
        """Callback khi mất kết nối"""
        self.connected = False
        logger.warning(f"Disconnected from MQTT broker. Code: {rc}")
    
    def on_message(self, client, userdata, msg):
        """Callback khi nhận message"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received message on topic '{topic}': {payload}")
            
            # Xử lý message theo topic
            self.handle_message(topic, payload)
            
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")
    
    def handle_message(self, topic: str, payload: Dict[str, Any]):
        """Xử lý message theo topic"""
        topic_parts = topic.split('/')
        
        if len(topic_parts) >= 4 and topic_parts[0] == 'locker' and topic_parts[1] == 'cell':
            cell_id = int(topic_parts[2])
            message_type = topic_parts[3]
            
            if message_type == 'status':
                self.handle_cell_status(cell_id, payload)
            elif message_type == 'event':
                self.handle_cell_event(cell_id, payload)
    
    def handle_cell_status(self, cell_id: int, payload: Dict[str, Any]):
        """Khi nhận status từ ESP32 (hoặc mqtt-monitor.html), cập nhật trạng thái cell trong DB và ghi log event"""
        try:
            if self.app:
                with self.app.app_context():
                    cell = CellModel.query.get(cell_id)
                    if not cell:
                        logger.warning(f"Cell {cell_id} not found in database")
                        return
                    new_status = payload.get('status')  # 'open' hoặc 'closed'
                    current_status = cell.status.value if hasattr(cell.status, 'value') else cell.status
                    if new_status and new_status != current_status:
                        # Chuyển đổi string sang enum
                        cell_status = CellStatus.open if new_status == 'open' else CellStatus.closed
                        cell.status = cell_status
                        
                        if new_status == 'open':
                            cell.last_open_at = get_vn_utc_now()
                            event_type = LockerEventType.open
                        elif new_status == 'closed':
                            cell.last_close_at = get_vn_utc_now()
                            event_type = LockerEventType.close
                        
                        # Ghi event với event_type là enum
                        event = CellEventModel(
                            locker_id=cell_id,
                            user_id=1,  # Hoặc None nếu không xác định được user
                            event_type=event_type,
                            timestamp=get_vn_utc_now()
                        )
                        db.session.add(event)
                        db.session.commit()
                        logger.info(f"Updated cell {cell_id} status to {new_status} from MQTT")
                    else:
                        logger.info(f"Received status for cell {cell_id} but no change: {new_status}")
        except Exception as e:
            logger.error(f"Error handling status message: {e}")
            if self.app:
                with self.app.app_context():
                    db.session.rollback()
    
    def handle_cell_event(self, cell_id: int, payload: Dict[str, Any]):
        """Log khi nhận event từ ESP32 - chỉ ghi log"""
        try:
            logger.info(f"Received event from ESP32 cell {cell_id}: {payload}")
            # Chỉ ghi log, không cập nhật database
        except Exception as e:
            logger.error(f"Error handling event message: {e}")
    
    def subscribe_topics(self):
        """Subscribe các topic cần thiết"""
        topics = [
            ("locker/cell/+/status", 0),  # Trạng thái từ ESP32
            ("locker/cell/+/event", 0),   # Events từ ESP32
        ]
        
        for topic, qos in topics:
            self.client.subscribe(topic, qos)
            logger.info(f"Subscribed to topic: {topic}")
    
    def publish_command(self, cell_id: int, command: str, data: Optional[Dict] = None) -> bool:
        """Gửi lệnh điều khiển tới ESP32"""
        if not self.connected:
            logger.error("MQTT client not connected")
            return False
        
        topic = f"locker/cell/{cell_id}/command"
        payload = {
            "action": command,
            "timestamp": get_vn_utc_now().isoformat(),
            **(data or {})
        }
        
        try:
            result = self.client.publish(topic, json.dumps(payload), qos=1)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Published command to {topic}: {payload}")
                return True
            else:
                logger.error(f"Failed to publish command to {topic}")
                return False
        except Exception as e:
            logger.error(f"Error publishing command: {e}")
            return False
    
    def connect(self):
        """Kết nối tới MQTT broker"""
        try:
            self.client = mqtt.Client()
            
            # Set callbacks
            self.client.on_connect = self.on_connect
            self.client.on_disconnect = self.on_disconnect
            self.client.on_message = self.on_message
            
            # Set credentials nếu có
            if self.username and self.password:
                self.client.username_pw_set(self.username, self.password)
            
            # Kết nối
            self.client.connect(self.broker_host, self.broker_port, self.keepalive)
            
            # Start loop
            self.client.loop_start()
            
            logger.info("MQTT client started")
            return True
            
        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}")
            return False
    
    def disconnect(self):
        """Ngắt kết nối MQTT"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("MQTT client disconnected")

# Singleton instance
mqtt_service = MQTTService()
