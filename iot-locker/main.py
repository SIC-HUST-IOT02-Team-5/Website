from app import create_app
from app.extensions import db

def setup_database(app):
    """Create all database tables if they do not exist."""
    with app.app_context():
        db.create_all()
        print("Database tables created or already exist.")

app = create_app()

if __name__ == '__main__':
    setup_database(app)
    app.run(debug=True, host='0.0.0.0')