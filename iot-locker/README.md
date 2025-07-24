# IoT Locker Management System

Hệ thống quản lý tủ khóa IoT sử dụng Flask và MySQL.

## Cấu trúc dự án

```
iot-locker/
├── app/                        # Thư mục chính chứa code backend
│   ├── models/                 # Models định nghĩa các bảng trong database
│   ├── routes/                 # API routes/endpoints
│   ├── schemas/                # Schemas validate dữ liệu
│   ├── services/               # Business logic
│   ├── utils/                  # Utilities và helpers
│   ├── __init__.py             # Khởi tạo Flask app
│   ├── config.py               # Cấu hình Flask app
│   └── extensions.py           # Các extensions (SQLAlchemy, Migrate...)
├── migrations/                 # Thư mục migrations (tự động tạo)
├── .env                        # Biến môi trường (database, credentials...)
├── docker-compose.yml          # Cấu hình Docker Compose
├── Dockerfile                  # Cấu hình image cho backend
├── main.py                     # Entry point của ứng dụng
└── requirements.txt            # Các dependencies Python
```

## Yêu cầu

- Docker và Docker Compose
- Git

## Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/SIC-HUST-IOT02-Team-5/Website.git
cd Website/iot-locker
```

### 2. Tạo file .env (hoặc sử dụng file .env.example)

```
FLASK_APP=main:app
FLASK_ENV=development

# Database connection settings
DB_USER=root
DB_PASSWORD=password
DB_HOST=db
DB_NAME=iot

# SQLAlchemy connection string
DATABASE_URL=mysql+pymysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}

# MySQL settings for Docker Compose
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=iot
```

### 3. Khởi động với Docker Compose

```bash
docker compose up -d
```

Lệnh này sẽ:
- Build backend từ Dockerfile
- Khởi động container MySQL
- Khởi động container Adminer để quản lý DB
- Tự động tạo các bảng cần thiết

### 4. Truy cập ứng dụng

- **API Backend**: [http://localhost:5000](http://localhost:5000)
- **Adminer (DB Management)**: [http://localhost:8080](http://localhost:8080)
  - System: MySQL
  - Server: db
  - Username: root
  - Password: password (từ .env)
  - Database: iot (từ .env)

## API Endpoints

### User Management

- `GET /users` - Lấy danh sách users
- `GET /users/{id}` - Lấy thông tin user
- `POST /users` - Tạo user mới
- `PUT /users/{id}` - Cập nhật thông tin user
- `DELETE /users/{id}` - Xóa user

## Workflow phát triển

### Thêm model mới

1. Tạo file model trong `app/models/`
2. Import model trong `main.py` để tự động tạo bảng
3. Tạo schema, service và route tương ứng
4. Khởi động lại container để áp dụng thay đổi

### Cài đặt package Python mới

1. Thêm package vào `requirements.txt`
2. Build lại container:
   ```bash
   docker compose down
   docker compose build
   docker compose up -d
   ```

### Thay đổi code

1. Chỉnh sửa code trực tiếp, không cần build lại nhờ volume mapping
2. Khởi động lại container để áp dụng thay đổi (nếu cần):
   ```bash
   docker compose restart backend
   ```

## Các lệnh hữu ích

```bash
# Xem logs của container
docker compose logs backend
docker compose logs db

# Dừng các container
docker compose down

# Dừng và xóa volumes (xóa dữ liệu)
docker compose down -v

# Shell vào container
docker compose exec backend bash
docker compose exec db bash
```

## Gỡ lỗi

### Connection refused khi kết nối MySQL

- Đảm bảo container MySQL đã khởi động
- Kiểm tra các thông tin kết nối trong .env
- Kiểm tra logs của container MySQL

### ImportError khi chạy backend

- Đảm bảo đã cài đầy đủ dependencies trong requirements.txt
- Build lại container với `docker compose build`
