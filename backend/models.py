import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Asia/Kolkata")
except Exception:
    IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30), name="IST")

def get_ist_now():
    return datetime.datetime.now(IST)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    role = Column(String(20), default="resident", nullable=False) # 'resident' or 'admin'
    created_at = Column(DateTime(timezone=True), default=get_ist_now)

    complaints = relationship("Complaint", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True) # e.g. CMP-2026-0042
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False) # 'Water Supply', 'Drainage', 'Stagnant Water', 'Garbage', 'Other'
    problem_type = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    photo_data = Column(Text, nullable=True)
    priority = Column(String(20), default="Medium", nullable=False) # 'High', 'Medium', 'Low'
    status = Column(String(20), default="Pending", nullable=False) # 'Pending', 'Assigned', 'In Progress', 'Resolved'
    assigned_to = Column(String(100), default="Unassigned", nullable=False)
    latitude = Column(Float, default=17.0850) # Conceptual coordinate for Ramaswami Peta
    longitude = Column(Float, default=81.8950)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)

    user = relationship("User", back_populates="complaints")
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False)
    previous_status = Column(String(20), nullable=False)
    new_status = Column(String(20), nullable=False)
    updated_by = Column(String(100), nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=get_ist_now)

    complaint = relationship("Complaint", back_populates="updates")

class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    q1_regular_water = Column(String(50), nullable=False) # Yes, No, Sometimes
    q2_summer_shortage = Column(String(50), nullable=False) # Yes, No, Sometimes
    q3_main_source = Column(String(100), nullable=False) # Municipal Tap, Borewell, Water Tanker, Others
    q6_drainage_maintenance = Column(String(50), nullable=False) # Yes, No, Partially
    q7_stagnant_water = Column(String(50), nullable=False) # Yes, No
    q8_drain_cleaning = Column(String(50), nullable=False) # Yes, No, Sometimes
    q9_mosquito_problems = Column(String(50), nullable=False) # Yes, No, Sometimes
    q10_flooding = Column(String(50), nullable=False) # Yes, No, Sometimes
    q11_garbage_collection = Column(String(50), nullable=False) # Yes, No, Sometimes
    q12_suggestion = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    complaint_id = Column(String(50), nullable=True)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)

    user = relationship("User", back_populates="notifications")

class AwarenessContent(Base):
    __tablename__ = "awareness_content"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    tips_json = Column(Text, nullable=False) # JSON array of tip strings
    icon_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
