#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define YOUR_WIFI ""
#define YOUR_PASS ""
#define PI_IP_OR_HOSTNAME ""

// Thông tin WiFi và MQTT
const char* ssid = YOUR_WIFI;
const char* password = YOUR_PASS;
const char* mqtt_server = PI_IP_OR_HOSTNAME;
const int   mqtt_port     = 1883;

// Cấu hình cho 2 cell
const int cell_ids[2] = {1, 2}; // ESP này điều khiển cell 1 và 2, code còn lại nạp cho cell 3,4

WiFiClient espClient;
PubSubClient client(espClient);

// Lưu user_id cho từng cell khi nhận lệnh
int last_user_id[2] = {0, 0};

// Hàm publish trạng thái cell
void publishStatus(int cell_idx, const char* status) {
  int cell_id = cell_ids[cell_idx];
  String payload = String("{\"status\":\"") + status + "\"}";
  String topic = String("locker/cell/") + cell_id + "/status";
  client.publish(topic.c_str(), payload.c_str());
}

// Hàm publish event cell (kèm user_id)
void publishEvent(int cell_idx, const char* event_type) {
  int cell_id = cell_ids[cell_idx];
  int user_id = last_user_id[cell_idx];
  String payload = String("{\"event_type\":\"") + event_type + "\",\"user_id\":" + user_id + "}";
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

  // Xác định cell nào
  for (int i = 0; i < 2; i++) {
    String cmdTopic = String("locker/cell/") + cell_ids[i] + "/command";
    if (String(topic) == cmdTopic) {
      last_user_id[i] = user_id; // Lưu user_id cho cell này

      if (action == "open") {
        Serial.println("Opening");
        // TODO: Thực thi code mở solenoid cho cell i (cell_ids[i])
        publishStatus(i, "open");
        publishEvent(i, "opened");
      } else if (action == "close") {
        Serial.println("Closing");
        // TODO: Thực thi code đóng solenoid cho cell i (cell_ids[i])
        publishStatus(i, "closed");
        publishEvent(i, "closed");
      }
    }
  }
}

// Hàm kết nối MQTT và đăng ký các topic
void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      // Subscribe lệnh cho 2 cell
      for (int i = 0; i < 2; i++) {
        String topic = String("locker/cell/") + cell_ids[i] + "/command";
        client.subscribe(topic.c_str(), 1);
        Serial.print("Subscribed to: ");
        Serial.println(topic);
      }
    } else {
      delay(2000);
    }
  }
}

unsigned long lastSensorCheck = 0;
String lastStatus[2];

void setup() {
    Serial.begin(115200);
  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");}
    Serial.println("WiFi connected");

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  reconnect();

  // Khởi tạo trạng thái thực tế cho từng cell
  for (int i = 0; i < 2; i++) {
    // TODO: Đọc trạng thái cảm biến thực tế cho cell_ids[i] khi khởi động
    // lastStatus[i] = readSensor(cell_ids[i]); // "open" hoặc "closed"
    lastStatus[i] = ""; // <-- Thay bằng code đọc cảm biến thực tế
  }
}



void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Quét trạng thái cảm biến mỗi 1 giây
  if (millis() - lastSensorCheck > 1000) {
    lastSensorCheck = millis();
    for (int i = 0; i < 2; i++) {
      // TODO: Code đọc trạng thái cảm biến cho cell_ids[i]
      // String currentStatus = readSensor(cell_ids[i]); // "open" hoặc "closed"
      String currentStatus = ""; // <-- Thay bằng code đọc cảm biến thực tế

      // Chỉ xử lý khi trạng thái chuyển từ "open" sang "closed" ( do chỉ đóng trực tiếp)
      if (lastStatus[i] == "open" && currentStatus == "closed") {
        lastStatus[i] = currentStatus;
        publishStatus(i, "closed");
        publishEvent(i, "closed");
        // TODO: Thực hiện các thao tác khác nếu cần khi đóng cửa trực tiếp
      } else if (currentStatus != "") {
        lastStatus[i] = currentStatus; // Cập nhật trạng thái mới nhất
      }
    }
  }
}
