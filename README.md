
# Backend-DB

## Mô tả dự án

Dự án này là backend cho hệ thống IoT, sử dụng Python, Flask, SQLAlchemy, PostgreSQL. Hỗ trợ chạy bằng Docker hoặc môi trường ảo Python.

## Cấu trúc thư mục

```
your-project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── locker.py
│   │   │   ├── device.py
│   │   │   └── history.py
│   │   └── schemas/      # nếu dùng Pydantic (optional)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── db-data/              # Docker volume
├── docker-compose.yml
├── .env                  # cấu hình DB
├── README.md
└── setup_env.sh
```

## Hướng dẫn cài đặt & chạy

### 1. Chuẩn bị môi trường

#### Linux/MacOS

- Đảm bảo đã cài Python >= 3.8 và pip.
- Cài đặt gói tạo môi trường ảo:
  ```bash
  sudo apt install python3-venv
  ```

#### Windows

- Cài Python từ https://python.org (chọn Add to PATH khi cài đặt).
- Mở Command Prompt hoặc PowerShell.


### 2. Tạo môi trường ảo Python (One-click setup)

Bạn có thể sử dụng script `setup_env.sh` để tự động tạo môi trường ảo và hướng dẫn cài đặt package nhanh chóng cho cả Windows và Linux.

**Cách sử dụng:**

```bash
bash setup_env.sh
```

Sau khi chạy script, làm theo hướng dẫn trên màn hình để kích hoạt môi trường ảo và cài đặt requirements.

**Tác dụng:**
- Tự động tạo thư mục môi trường ảo `venv/`.
- Hiển thị hướng dẫn kích hoạt venv cho từng hệ điều hành.
- Hướng dẫn cài đặt các package cần thiết.

Hoặc bạn vẫn có thể tự tạo venv thủ công như hướng dẫn bên dưới:

```bash
python3 -m venv venv
```
Hoặc trên Windows:
```cmd
python -m venv venv
```

### 3. Kích hoạt môi trường ảo

- **Linux/MacOS:**
  ```bash
  source venv/bin/activate
  ```
- **Windows:**
  ```cmd
  venv\Scripts\activate
  ```

### 4. Cài đặt các package cần thiết

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 5. Thiết lập file cấu hình `.env`

Sao chép file `.env` mẫu hoặc chỉnh sửa cho phù hợp:
```
DB_NAME=iot_db
DB_USER=root
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432
```
- Nếu chạy bằng Docker, giữ nguyên `DB_HOST=db`.
- Nếu chạy PostgreSQL local, đổi `DB_HOST=localhost` và `DB_PORT=5433` (theo docker-compose).

### 6. Chạy ứng dụng

```bash
python backend/run.py
```
Ứng dụng sẽ tự động tạo các bảng trong database.

---

## Chạy bằng Docker (khuyên dùng cho teamwork)

1. Cài Docker Desktop (Windows) hoặc Docker Engine (Linux).
2. Chạy lệnh sau tại thư mục dự án:
   ```bash
   docker-compose up --build
   ```
3. Truy cập Adminer tại http://localhost:8081 để kiểm tra database.

### 1. Cài đặt Docker

- **Windows:**
  - Tải và cài Docker Desktop tại: https://www.docker.com/products/docker-desktop
  - Khởi động Docker Desktop sau khi cài đặt.

- **Linux (Debian/Ubuntu):**
  ```bash
  sudo apt update
  sudo apt install ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl start docker
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  # Đăng xuất và đăng nhập lại để áp dụng quyền
  ```

### 2. Chạy dự án bằng Docker Compose

Tại thư mục gốc dự án, chạy các lệnh sau:

```bash
# Build và khởi động các service (db, backend, adminer)
docker compose up --build

# Nếu muốn chạy nền (không chiếm terminal)
docker compose up -d --build

# Dừng các service
docker compose down

# Xem log các service
docker compose logs
```

### 3. Truy cập các dịch vụ

- Backend API: http://localhost:5001
- Adminer (quản lý DB): http://localhost:8081

### 4. Lưu ý

- Nếu lần đầu chạy, Docker sẽ tự tạo thư mục `db-data/` để lưu dữ liệu PostgreSQL.
- File `.env` cần có thông tin kết nối DB đúng như hướng dẫn ở trên.

---

## Lưu ý khi teamwork

- Không commit thư mục `venv/`, `db-data/`, file dữ liệu cá nhân.
- File `.env` nên được chia sẻ để các thành viên cấu hình giống nhau.
- Đã có `.gitignore` để loại trừ các file không cần thiết.
- Nếu có thay đổi về cấu trúc DB, cập nhật models và chạy lại `run.py` để migrate.

---

## Troubleshooting

- Nếu lỗi khi cài package, kiểm tra đã kích hoạt đúng môi trường ảo.
- Nếu không kết nối được DB, kiểm tra lại thông tin trong `.env` và trạng thái container Docker.

---

Bạn chỉ cần làm theo các bước trên, mọi thành viên đều có thể cài đặt và chạy dự án trên cả Windows và Linux dễ dàng!
