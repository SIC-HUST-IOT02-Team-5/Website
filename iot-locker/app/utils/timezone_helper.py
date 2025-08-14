from datetime import datetime, timezone, timedelta
from sqlalchemy import func

# Định nghĩa timezone Việt Nam (GMT+7)
VN_TIMEZONE = timezone(timedelta(hours=7))

def get_vn_now():
    """Lấy thời gian hiện tại theo timezone Việt Nam (GMT+7)"""
    return datetime.now(VN_TIMEZONE)

def get_vn_utc_now():
    """Lấy thời gian hiện tại UTC nhưng đã adjust cho Việt Nam"""
    return datetime.utcnow() + timedelta(hours=7)

def vn_func_now():
    """SQLAlchemy func.now() với timezone offset cho Việt Nam"""
    # Sử dụng CONVERT_TZ để chuyển đổi UTC sang GMT+7
    return func.convert_tz(func.utc_timestamp(), '+00:00', '+07:00')

def to_vn_timezone(utc_datetime):
    """Chuyển đổi UTC datetime sang Việt Nam timezone"""
    if utc_datetime is None:
        return None
    if utc_datetime.tzinfo is None:
        # Assume UTC if no timezone info
        utc_datetime = utc_datetime.replace(tzinfo=timezone.utc)
    return utc_datetime.astimezone(VN_TIMEZONE)

def format_vn_datetime(dt):
    """Format datetime theo timezone Việt Nam"""
    if dt is None:
        return None
    vn_dt = to_vn_timezone(dt) if dt.tzinfo else dt
    return vn_dt.strftime("%Y-%m-%d %H:%M:%S")
