from flask import Flask
from app.extensions import db, migrate
from app.routes.user_route import user_bp
from app.routes.cell_route import cell_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(user_bp)
    app.register_blueprint(cell_bp)

    return app

app = create_app()

# Hàm kiểm tra và tạo bảng tự động
def setup_database(app):
    with app.app_context():
        # Tạo các bảng nếu chưa tồn tại
        db.create_all()
        print("Database tables created or already exist.")

if __name__ == '__main__':
    # Setup database trước khi khởi động server
    setup_database(app)
    app.run(debug=True, host='0.0.0.0')
