# Hệ thống quản lý tủ khóa thông minh

Ứng dụng PyQt6 để quản lý tủ khóa thông minh với giao diện người dùng thân thiện và hỗ trợ đăng nhập bằng RFID và mã truy cập.

## Tính năng chính

- 🔐 **Đăng nhập đa phương thức**: RFID và mã truy cập JWT
- 📦 **Quản lý mượn/trả thiết bị**: Giao diện trực quan để chọn tủ khóa
- ⏱️ **Đếm ngược thời gian**: Theo dõi thời gian sử dụng tủ khóa
- 🔄 **Tự động hoàn tất**: Xử lý tự động khi hết thời gian
- 📱 **Giao diện responsive**: Tối ưu cho màn hình cảm ứng
- 🎨 **Thiết kế hiện đại**: UI/UX thân thiện với người dùng

## Cấu trúc ứng dụng

### Luồng hoạt động (Flow)

```
WelcomeScreen (P0)
  ├─> LoginRFIDScreen (P1) ──> ActionSelectScreen (P3)
  └─> LoginCodeScreen (P2) ──> ActionSelectScreen (P3)
                                    ├─> LockerSelectBorrowScreen (P4a)
                                    └─> LockerSelectReturnScreen (P4b)
                                              ↓
                                    ConfirmActionScreen (P5)
                                              ↓
                                    LockerCountdownScreen (P6)
                                              ↓
                                    DoneScreen (P7)
                                              ↓
                                    Quay lại Welcome (P0)
```

### Các màn hình chính

1. **WelcomeScreen (P0)**: Màn hình chào mừng, chọn phương thức đăng nhập
2. **LoginRFIDScreen (P1)**: Đọc thẻ RFID để đăng nhập
3. **LoginCodeScreen (P2)**: Nhập mã truy cập JWT
4. **ActionSelectScreen (P3)**: Chọn hành động mượn/trả
5. **LockerSelectScreen (P4a/P4b)**: Chọn tủ khóa để mượn/trả
6. **ConfirmActionScreen (P5)**: Xác nhận hành động và mở tủ
7. **CountdownScreen (P6)**: Theo dõi thao tác và đếm ngược
8. **DoneScreen (P7)**: Thông báo hoàn tất

## Cài đặt

### Yêu cầu hệ thống

- Python 3.8+
- PyQt6
- pyserial (cho RFID reader)
- requests (cho API calls)

### Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### Cấu hình

Tạo file `config.json` (hoặc ứng dụng sẽ tạo file mặc định):

```json
{
  "api": {
    "base_url": "http://localhost:8000",
    "timeout": 30,
    "retry_attempts": 3
  },
  "rfid": {
    "port": "/dev/ttyUSB0",
    "baudrate": 9600,
    "timeout": 1
  },
  "ui": {
    "theme": "light",
    "language": "vi",
    "fullscreen": true,
    "countdown_time": 300
  },
  "locker": {
    "max_borrow_time": 3600,
    "warning_time": 300
  }
}
```

## Chạy ứng dụng

```bash
python main.py
```

## Cấu trúc thư mục

```
├── main.py                 # Entry point
├── app_manager.py          # Quản lý navigation
├── requirements.txt        # Dependencies
├── config.json            # Cấu hình ứng dụng
├── README.md              # Hướng dẫn sử dụng
├── utils/                 # Utilities
│   ├── __init__.py
│   ├── config.py          # Quản lý cấu hình
│   ├── logger.py          # Logging
│   ├── api_client.py      # API client
│   └── rfid_reader.py     # RFID reader
└── screens/               # Các màn hình
    ├── __init__.py
    ├── base_screen.py     # Base screen class
    ├── welcome_screen.py  # P0
    ├── rfid_login_screen.py  # P1
    ├── code_login_screen.py  # P2
    ├── action_select_screen.py  # P3
    ├── locker_select_screen.py  # P4a/P4b
    ├── confirm_action_screen.py  # P5
    ├── countdown_screen.py  # P6
    └── done_screen.py     # P7
```

## API Endpoints

Ứng dụng giao tiếp với backend qua các API endpoints:

- `POST /api/auth/rfid` - Đăng nhập bằng RFID
- `POST /api/auth/code` - Đăng nhập bằng mã JWT
- `GET /api/user/info` - Lấy thông tin người dùng
- `GET /api/lockers/available` - Lấy danh sách tủ khóa có thể mượn
- `GET /api/lockers/user` - Lấy danh sách tủ khóa đã mượn
- `POST /api/lockers/open` - Mở tủ khóa
- `POST /api/lockers/confirm` - Xác nhận hành động
- `GET /api/lockers/{id}/status` - Kiểm tra trạng thái tủ khóa

## RFID Reader

Ứng dụng hỗ trợ đọc thẻ RFID qua USB/UART với các định dạng:

- `UID: 1234567890ABCDEF`
- `Card UID: 1234567890ABCDEF`
- Raw UID: `1234567890ABCDEF`

## Tính năng nâng cao

### Đếm ngược thời gian
- Mặc định 5 phút cho mỗi thao tác
- Cảnh báo khi còn 1 phút
- Tự động hoàn tất khi hết thời gian

### Kiểm tra trạng thái tủ khóa
- Kiểm tra định kỳ trạng thái tủ khóa
- Tự động hoàn tất khi tủ được đóng

### Logging
- Log tất cả các hoạt động
- Lưu log theo ngày
- Hỗ trợ debug và monitoring

## Phát triển

### Thêm màn hình mới

1. Tạo file màn hình trong thư mục `screens/`
2. Kế thừa từ `BaseScreen`
3. Thêm vào `AppManager`
4. Kết nối signals và slots

### Tùy chỉnh giao diện

- Chỉnh sửa stylesheet trong các màn hình
- Thay đổi màu sắc và font chữ
- Thêm icons và animations

## Troubleshooting

### Lỗi kết nối RFID
- Kiểm tra port và baudrate trong config
- Đảm bảo quyền truy cập serial port
- Kiểm tra kết nối phần cứng

### Lỗi API
- Kiểm tra URL backend trong config
- Đảm bảo network connectivity
- Kiểm tra authentication token

### Lỗi giao diện
- Kiểm tra PyQt6 installation
- Đảm bảo display settings
- Kiểm tra screen resolution

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển. 