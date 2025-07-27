from flask import Flask, jsonify
from app.extensions import db, migrate
from app.routes.user_route import user_bp
from app.routes.cell_route import cell_bp
from app.routes.item_route import item_bp
from app.routes.cell_event_route import cell_event_bp
from app.routes.borrowings_route import borrowings_bp
from app.auth.auth_route import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(cell_bp)
    app.register_blueprint(item_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(cell_event_bp)
    app.register_blueprint(borrowings_bp)

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