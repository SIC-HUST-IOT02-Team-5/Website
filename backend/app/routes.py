from flask import Blueprint, jsonify
from .models import Device
from . import db

main = Blueprint("main", __name__)

@main.route("/")
def hello():
    return "Hello, Flask is running!"

@main.route("/devices")
def get_devices():
    devices = Device.query.all()
    return jsonify([{"id": d.id, "name": d.name, "status": d.status} for d in devices])
