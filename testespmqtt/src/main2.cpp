#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Arduino.h>

volatile bool pendingClose = false; // flag báo hiệu cần đóng khoá từ command

#define HALL_PIN  21 // định nghĩa chân kết nối cảm biến Hall
#define RELAY_PIN 26      // Relay điều khiển khoá

#define YOUR_WIFI ""
#define YOUR_PASS ""
#define PI_IP_OR_HOSTNAME "" // địa chỉ IP của mqtt broker
#define CELL_ID 1 // ID của cell 

// Thông tin WiFi và MQTT
const char* ssid = YOUR_WIFI;
const char* password = YOUR_PASS;
const char* mqtt_server = PI_IP_OR_HOSTNAME;
const int   mqtt_port     = 1883;

// Cấu hình cho 2 cell
const int cell_id = CELL_ID; 
WiFiClient espClient;
PubSubClient client(espClient);

// Lưu user_id cho từng cell khi nhận lệnh
int last_user_id = 0;

// Hàm publish trạng thái cell
void publishStatus(const char* status) {
  String payload = String("{\"status\":\"") + status + "\"}";
  String topic = String("locker/cell/") + cell_id + "/status";
  client.publish(topic.c_str(), payload.c_str());
}

// Hàm publish event cell (kèm user_id)
void publishEvent(const char* event_type) {
  String payload = String("{\"event_type\":\"") + event_type + "\",\"user_id\":" + last_user_id + "}";
  String topic = String("locker/cell/") + cell_id + "/event";
  client.publish(topic.c_str(), payload.c_str());
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Parse JSON payload bằng ArduinoJson
  JsonDocument doc;
  char jsonBuffer[256];
  memcpy(jsonBuffer, payload, length);
  jsonBuffer[length] = '\0';

  Serial.print("Raw payload: ");
  Serial.println(jsonBuffer);

  DeserializationError error = deserializeJson(doc, jsonBuffer);
  if (error) {
    Serial.print("JSON parse failed: ");
    Serial.println(error.c_str());
    return;
  }

  // Lấy action và user_id từ JSON
  String action = doc["action"] | "";
  int user_id = doc["user_id"] | 0;

    String cmdTopic = String("locker/cell/") + cell_id + "/command";
    if (String(topic) == cmdTopic) {
      last_user_id = user_id; // Lưu user_id cho cell này

      if (action == "open") {
        Serial.println("Opening");
        // TODO: Thực thi code mở solenoid cho cell i 
        digitalWrite(RELAY_PIN, HIGH); // Mở khoá
        
        publishStatus("open");
        publishEvent("opened");

        Serial.println("Open done");

      } else if (action == "close") {
        Serial.println("Closing");
        pendingClose = true; // Đánh dấu chờ đóng
        // Ở đây không dùng hàm đợi đến khi đóng vì có thể sẽ ảnh hưởng tới loop mqtt
      }
    }
}

// Hàm kết nối MQTT và đăng ký các topic
void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      // Subscribe lệnh 
        String topic = String("locker/cell/") + cell_id + "/command";
        client.subscribe(topic.c_str(), 1);
        Serial.print("Subscribed to: ");
        Serial.println(topic);
    } else {
      delay(2000);
    }
  }
}

// Hall_sensor
volatile uint32_t lastChangeTime = 0;
volatile bool hallState = LOW;     // trang thai ban dau la low (tich cuc muc thap) (cua dong)
const uint32_t debounceDelay = 100;  
bool justClosedByCommand = false;

// Hàm xử lý ngắt khi có thay đổi trạng thái cảm biến Hall
void IRAM_ATTR hallISR() {
  uint32_t now = millis();
 
  if (now - lastChangeTime > debounceDelay) {
    hallState = digitalRead(HALL_PIN);
    lastChangeTime = now;
  }
}


unsigned long lastSensorCheck = 0;
String lastStatus;
String currentStatus;

void setup() {
  pinMode(HALL_PIN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Mặc định đóng khoá

  Serial.begin(115200);
  attachInterrupt(digitalPinToInterrupt(HALL_PIN), hallISR, CHANGE);
  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");}
    Serial.println("WiFi connected");

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  reconnect();

  // Khởi tạo trạng thái thực tế của cell khi khỏi động
  if (hallState == LOW) {
    Serial.println("CUA BAN DAU DONG");
    lastStatus = "closed";
  } else {
    Serial.println("CUA BAN DAU MO");
    lastStatus = "open";
  }
}



void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Quét trạng thái cảm biến mỗi 1 giây
  if (millis() - lastSensorCheck > 1000) {
    lastSensorCheck = millis();
  
    if (hallState == LOW) {
      Serial.println("CUA DONG");
      currentStatus = "closed";
    } else {
      Serial.println("CUA MO");
      currentStatus = "open";
    }
    
    if (pendingClose && hallState == LOW) {
      Serial.println("Thuc hien dong relay");
      digitalWrite(RELAY_PIN, LOW); // Đóng khoá
      publishStatus("closed");
      publishEvent("closed");
      pendingClose = false; // reset trạng thái
      justClosedByCommand = true; // đánh dấu đã publish
    }

      // Chỉ xử lý khi trạng thái chuyển từ "open" sang "closed" ( do chỉ đóng trực tiếp)
      if (!justClosedByCommand && lastStatus == "open" && currentStatus == "closed") {
        lastStatus = currentStatus;
        digitalWrite(RELAY_PIN, LOW); // Đóng khoá
        publishStatus("closed");
        publishEvent("closed");
        
      } else if (currentStatus != "") {
        lastStatus = currentStatus; // Cập nhật trạng thái mới nhất
      }
    justClosedByCommand = false;
  }
}
