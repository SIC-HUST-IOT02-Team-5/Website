# 1. Base image là Python 3.11 trên Debian Linux
FROM python:3.11-slim

# 2. Set working directory
WORKDIR /app

# 3. Copy requirements.txt trước để tận dụng cache layer
COPY requirements.txt ./

# 4. Cài đặt pip và requirements
RUN python -m ensurepip && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. Copy toàn bộ source code vào image (sau khi đã cài requirements)
COPY . .

# 6. Expose port Flask (tuỳ chỉnh nếu bạn dùng cổng khác)
EXPOSE 5000

# 7. Lệnh chạy app Flask
CMD ["python", "main.py"]
