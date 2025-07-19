#!/bin/bash
# Tạo và kích hoạt môi trường ảo Python
python3 -m venv venv
echo "Nếu bạn dùng Linux/MacOS:"
echo "  source venv/bin/activate"
echo "Nếu bạn dùng Windows:"
echo "  venv\\Scripts\\activate"
echo "Sau khi kích hoạt, chạy các lệnh sau để cài requirements:"
echo "  pip install --upgrade pip"
echo "  pip install -r backend/requirements.txt"
