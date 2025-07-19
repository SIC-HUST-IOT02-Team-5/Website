#!/bin/bash
# Script tạo môi trường ảo Python giống hệt máy bạn cho cả Windows và Linux
# Yêu cầu: Python 3.11.2 (xem file .python-version)

PYTHON_REQUIRED="3.11.2"
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
if [[ "$PYTHON_VERSION" != "$PYTHON_REQUIRED" ]]; then
  echo "Vui lòng cài Python $PYTHON_REQUIRED để đảm bảo môi trường giống hệt!"
  echo "Bạn có thể tải tại: https://www.python.org/downloads/release/python-3112/"
  exit 1
fi

# Tạo môi trường ảo
python -m venv venv

# Hướng dẫn kích hoạt venv
echo "Nếu bạn dùng Linux/MacOS:"
echo "  source venv/bin/activate"
echo "Nếu bạn dùng Windows:"
echo "  venv\\Scripts\\activate"

# Hướng dẫn cài lib
echo "Sau khi kích hoạt venv, chạy các lệnh sau để cài đúng phiên bản lib:"
echo "  pip install --upgrade pip"
echo "  pip install -r backend/requirements.txt"
