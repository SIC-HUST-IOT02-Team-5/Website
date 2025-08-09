from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from app.extensions import db, migrate
from app.routes.user_route import user_bp
from app.routes.cell_route import cell_bp
from app.routes.item_route import item_bp
from app.routes.cell_event_route import cell_event_bp
from app.routes.borrowings_route import borrowings_bp
from app.routes.dashboard_route import dashboard_bp
from app.auth.auth_route import auth_bp
from flask_cors import CORS
import os
from datetime import timedelta

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=float(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 1)))
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES_DAYS', 30)))
    
    # Set timezone for Flask app
    app.config['TIMEZONE'] = 'Asia/Ho_Chi_Minh'
    
    JWTManager(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Initialize MQTT service
    with app.app_context():
        try:
            from app.services.mqtt_service import mqtt_service
            # Store app instance in mqtt_service for context
            mqtt_service.app = app
            mqtt_service.connect()
        except Exception as e:
            app.logger.error(f"Failed to initialize MQTT service: {e}")

    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(cell_bp)
    app.register_blueprint(item_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(cell_event_bp)
    app.register_blueprint(borrowings_bp)
    app.register_blueprint(dashboard_bp)

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app# Empty file - import moved to avoid circular dependency