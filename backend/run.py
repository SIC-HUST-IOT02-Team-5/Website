from app.db import engine, Base
import app.models  # phải import để Base biết tới các model

def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    create_tables()
