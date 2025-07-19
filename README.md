# Backend-DB

## Hướng dẫn cài đặt môi trường phát triển

### 1. Tạo môi trường ảo Python

Chạy lệnh sau trong thư mục dự án:

```bash
python3 -m venv venv
```

### 2. Kích hoạt môi trường ảo

- **Linux/MacOS:**
  ```bash
  source venv/bin/activate
  ```
- **Windows:**
  ```cmd
  venv\Scripts\activate
  ```

### 3. Cài đặt các package cần thiết

Sau khi đã kích hoạt môi trường ảo, chạy:

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 4. Chạy ứng dụng

```bash
python backend/run.py
```

## Lưu ý
- File `.env` chứa thông tin cấu hình database, cần được thiết lập phù hợp.
- Không commit các file dữ liệu, môi trường ảo, hoặc thông tin nhạy cảm lên git.
- Đã có file `.gitignore` để hỗ trợ teamwork.
