#!/usr/bin/env python3
"""
Test script để kiểm tra MQTT integration
Chạy script này để test các message MQTT
"""

import json
import time
import paho.mqtt.client as mqtt

# MQTT Configuration
MQTT_BROKER = "localhost"
MQTT_PORT = 1883

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
        
        # Subscribe tất cả topic của locker
        client.subscribe("locker/+/+/+")
        print("Subscribed to locker topics")
    else:
        print(f"Failed to connect. Return code {rc}")

def on_message(client, userdata, msg):
    topic = msg.topic
    try:
        payload = json.loads(msg.payload.decode())
        print(f"📨 Received on '{topic}': {payload}")
    except:
        payload = msg.payload.decode()
        print(f"📨 Received on '{topic}': {payload}")

def send_test_messages(client):
    """Gửi một số message test"""
    
    # Test 1: ESP32 báo trạng thái cell
    test_status = {
        "status": "open",
        "hall_sensor": 1,
        "relay": 1,
        "timestamp": time.time()
    }
    
    client.publish("locker/cell/1/status", json.dumps(test_status))
    print(f"📤 Sent cell status: {test_status}")
    
    time.sleep(2)
    
    # Test 2: ESP32 báo event
    test_event = {
        "event_type": "opened",
        "user_id": 1,
        "timestamp": time.time()
    }
    
    client.publish("locker/cell/1/event", json.dumps(test_event))
    print(f"📤 Sent cell event: {test_event}")
    
    time.sleep(2)
    
    # Test 3: Backend gửi lệnh (simulate)
    test_command = {
        "action": "open",
        "user_id": 1,
        "timestamp": time.time()
    }
    
    client.publish("locker/cell/1/command", json.dumps(test_command))
    print(f"📤 Sent command: {test_command}")

def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        
        # Đợi kết nối
        time.sleep(2)
        
        # Gửi test messages
        send_test_messages(client)
        
        # Đợi nhận response
        print("\n⏳ Listening for messages... Press Ctrl+C to stop")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping MQTT test client...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()
