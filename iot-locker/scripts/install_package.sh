#!/bin/bash
# Script để cài đặt gói mới mà không cần build lại container

if [ $# -eq 0 ]; then
  echo "Cách sử dụng: ./install_package.sh <tên_gói> [<phiên_bản>]"
  exit 1
fi

PACKAGE=$1
VERSION=$2

if [ -n "$VERSION" ]; then
  docker compose exec backend pip install $PACKAGE==$VERSION
else
  docker compose exec backend pip install $PACKAGE
fi

echo "Đã cài đặt $PACKAGE"
echo "Nhớ thêm gói này vào requirements.txt nếu cần sử dụng lâu dài!"
