
from flask import Flask
from app.extensions import db, migrate
from app.routes.user_route import user_bp
from app.routes.cell_route import cell_bp
from app.routes.item_route import item_bp
from app.auth.auth_route import auth_bp
from app.routes.cell_event_route import cell_event_bp

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

    return app

app = create_app()

def setup_database(app):
    """Create all database tables if they do not exist."""
    with app.app_context():
        db.create_all()
        print("Database tables created or already exist.")

if __name__ == '__main__':
    setup_database(app)
    app.run(debug=True, host='0.0.0.0')
