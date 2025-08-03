from app.extensions import db
from app.models.cell_event_model import CellEventModel, LockerEventType


class CellEventService:
    @staticmethod
    def create_event(locker_id, user_id, event_type):
        """
        Create a cell event (open/close) for a locker.
        event_type should be a LockerEventType or its value ("open"/"close").
        """
        if not isinstance(event_type, LockerEventType):
            event_type = LockerEventType(event_type)
        event = CellEventModel(
            locker_id=locker_id,
            user_id=user_id,
            event_type=event_type
        )
        db.session.add(event)
        db.session.commit()
        return event

    @staticmethod
    def get_all_events():
        return CellEventModel.query.options(
            db.joinedload(CellEventModel.user),
            db.joinedload(CellEventModel.cell)
        ).order_by(CellEventModel.timestamp.desc()).all()

    @staticmethod
    def get_events_by_cell(locker_id):
        return CellEventModel.query.filter_by(locker_id=locker_id).order_by(CellEventModel.timestamp.desc()).all()
