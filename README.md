# ByteStorage - Smart Shared Locker System 🔐

[![License: Academic Use Only](https://img.shields.io/badge/License-Academic%20Use%20Only-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-brightgreen.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com)

**Hệ thống tủ đồ dùng thông minh IoT** - Tự động hóa quy trình quản lý, mượn, trả đồ dùng chung trong môi trường nội bộ (công ty, văn phòng, lab, trường học), giảm phụ thuộc vào quản trị viên thủ công và tăng tính minh bạch, chính xác.

## 📖 Thông tin dự án

**Samsung Innovation Campus - HUST IOT02 - Nhóm 5**
- **Thời gian**: Kỳ 2024.3
- **Giảng viên hướng dẫn**: Nguyễn Việt Tùng
- **Team Leader**: Phạm Việt Anh
- **Thành viên**: Phạm Trường Thành, Phạm Yến Nhi, Trần Tuấn Tú, Khuất Đình Nguyên, Trần Lê Huy Bình

## 🎯 Bối cảnh và mục tiêu

### Vấn đề giải quyết
- Không thể theo dõi lịch sử mượn/trả thiết bị
- Không biết thiết bị đang ở đâu, bị mượn hay đã trả
- Không kiểm soát được quyền truy cập tủ
- Thiết bị bị thất lạc, hư hỏng không truy vết được
- Không có cảnh báo nếu thiết bị bị giữ quá lâu
- Việc bàn giao/cho mượn giữa người dùng với nhau gây thất thoát

### Đối tượng sử dụng
- Văn phòng công ty chia sẻ thiết bị kỹ thuật, tài liệu
- Phòng lab trường đại học có nhiều sinh viên mượn dùng thiết bị
- Không gian làm việc chung (coworking space) cần lưu trữ tài sản cá nhân
- Thư viện, trung tâm nghiên cứu cần quản lý lưu giữ tài liệu, thiết bị lưu động
- Phòng hành chính cần lưu chìa khóa, giấy tờ, hồ sơ luân chuyển

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React TS)    │◄──►│   (Flask)       │◄──►│    (MySQL)      │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        
         │                        │                        
         ▼                        ▼                        
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kiosk Mode    │    │  MQTT Broker    │    │   IoT Hardware  │
│   (/kiosk)      │    │  (Mosquitto)    │    │    (ESP32)      │
│                 │    │   Port: 1883    │    │   WiFi + MQTT   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Các thành phần chính

1. **Backend API** (`/iot-locker`)
   - Flask REST API với JWT authentication
   - SQLAlchemy ORM với MySQL
   - MQTT client cho IoT communication
   - Quản lý users, cells, items, borrowings

2. **Frontend Web Admin** (`/frontend`)
   - React TypeScript với Vite
   - Admin dashboard để quản lý hệ thống
   - Real-time MQTT status monitoring
   - Responsive design

3. **Kiosk Interface** 
   - Tích hợp trong web tại route `/kiosk`
   - Giao diện tối ưu cho màn hình cảm ứng
   - Workflow: Login → Select Action → Choose Cell → Confirm

4. **IoT Hardware** (`/testespmqtt`)
   - ESP32 với WiFi và MQTT
   - Cảm biến Hall để detect trạng thái tủ
   - Relay điều khiển khóa điện từ
   - Real-time status reporting

5. **MQTT Broker** (`/mosquitto`)
   - Eclipse Mosquitto
   - Message routing giữa backend và IoT
   - Topics: `locker/cell/{id}/{status|event}`

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Docker & Docker Compose
- Git
- VSCode/IDE để edit code ESP32 (optional)

### 1. Clone repository
```bash
git clone https://github.com/SIC-HUST-IOT02-Team-5/Website.git
cd Website
```

### 2. Tạo file cấu hình môi trường

#### Tạo file .env cho backend
```bash
cp iot-locker/.env.example iot-locker/.env
```

#### Tạo file .env.dev cho development
```bash
cp .env.dev.example .env.dev
```

**Lưu ý**: Bạn có thể chỉnh sửa các giá trị trong file `.env` và `.env.dev` theo nhu cầu:
- Database credentials
- JWT secret key  
- MQTT broker settings
- Timezone settings

### 3. Khởi động hệ thống
```bash
# Development mode với hot reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Hoặc production mode
docker compose up --build -d
```

### 4. Truy cập ứng dụng

- **Frontend Admin**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Kiosk Mode**: [http://localhost:5173/kiosk](http://localhost:5173/kiosk)
- **Adminer (DB Management)**: [http://localhost:8080](http://localhost:8080)
  - Server: `db`
  - Username: `root`
  - Password: `password` (từ .env)
  - Database: `iot`
- **MQTT Web Client**: [http://localhost:8000](http://localhost:8000) (dev mode only)

### 5. Cấu hình ESP32

#### Upload code lên ESP32
1. Mở thư mục `/testespmqtt` trong PlatformIO IDE
2. Chỉnh sửa file `src/main2.cpp`:
   ```cpp
   #define YOUR_WIFI "TenWiFi"
   #define YOUR_PASS "MatKhauWiFi"  
   #define PI_IP_OR_HOSTNAME "192.168.1.100"  // IP của máy chạy Docker
   #define CELL_ID 1  // ID của cell (1, 2, 3, ...)
   ```
3. Upload code lên ESP32

#### Kết nối phần cứng
```
ESP32 Pin Connections:
├── Pin 21: Hall Sensor (cảm biến từ)
├── Pin 26: Relay Module (điều khiển khóa)
├── GND: Common Ground
└── 3.3V/5V: Power Supply
```

## 📱 Sử dụng hệ thống

### Admin Dashboard
1. Truy cập [http://localhost:5173](http://localhost:5173)
2. Đăng nhập với tài khoản admin
3. Quản lý users, categories, cells, actions log

### Kiosk Mode  
1. Truy cập [http://localhost:5173/kiosk](http://localhost:5173/kiosk)
2. Đăng nhập bằng username/password
3. Chọn hành động: Mượn/Trả
4. Chọn cell/item
5. Xác nhận và hoàn tất

### IoT Hardware
- ESP32 tự động kết nối WiFi và MQTT broker
- Gửi trạng thái real-time khi tủ được mở/đóng
- Nhận lệnh điều khiển từ backend

## 🛠️ API Documentation

### Authentication
```bash
POST /auth/login
POST /auth/refresh
```

### User Management
```bash
GET    /users          # Lấy danh sách users
GET    /users/{id}     # Lấy thông tin user  
POST   /users          # Tạo user mới
PUT    /users/{id}     # Cập nhật user
DELETE /users/{id}     # Xóa user
```

### Cell Management
```bash
GET    /cells          # Lấy danh sách cells
POST   /cells          # Tạo cell mới
PUT    /cells/{id}     # Cập nhật cell
DELETE /cells/{id}     # Xóa cell
```

### Item & Borrowing Management
```bash
GET    /items          # Lấy danh sách items
POST   /borrowings     # Tạo borrowing mới
GET    /borrowings     # Lấy lịch sử mượn/trả
```

📋 **API Collection**: Import file `iot-locker/docs/postman_collection.json` vào Postman để test API.

## 🎬 Demo

🎥 **Video Demo**: [Xem tại đây](https://drive.google.com/file/d/1T5ueqouvYkpNkDmGKrjtfIDHg1d8JfMU/view)

📋 **Báo cáo chi tiết**: [Xem tại đây](https://husteduvn-my.sharepoint.com/:f:/g/personal/nhi_py236269_sis_hust_edu_vn/Ek16uYIAF6xEqbwZwBDhYqsBajzdUCTn9ktbkdQQIzVpYg?e=545KnQ)

## 🔧 Development

### Cấu trúc thư mục
```
├── frontend/              # React TypeScript frontend
├── iot-locker/           # Flask backend API  
├── app/                  # PyQt kiosk app (deprecated)
├── testespmqtt/          # ESP32 firmware
├── mosquitto/            # MQTT broker config
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development compose
└── README.md
```

### Workflow phát triển
1. Chỉnh sửa code
2. Container tự động reload (development mode)
3. Test API với Postman collection
4. Kiểm tra MQTT messages qua web client

### Các lệnh hữu ích
```bash
# Xem logs
docker compose logs backend
docker compose logs frontend

# Restart service
docker compose restart backend

# Shell vào container  
docker compose exec backend bash
docker compose exec db mysql -u root -p
```

## ⚠️ Hạn chế hiện tại

- **Tính năng đăng nhập RFID và one-time passcode** chưa được hoàn thiện đầy đủ
- Chưa có kế hoạch phát triển tiếp theo do dự án đã kết thúc

## 📄 License

Dự án này chỉ được sử dụng cho mục đích học thuật (Academic Use Only). 

---

**📧 Liên hệ**: Project Leader - Phạm Việt Anh (anh.pv238743@sis.hust.edu.vn)  
**🔗 Repository**: [GitHub](https://github.com/SIC-HUST-IOT02-Team-5/Website)

*Được phát triển với ❤️ bởi Samsung Innovation Campus - HUST IOT02 - Nhóm 5*