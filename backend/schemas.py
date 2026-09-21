import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str = "resident"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str
    role: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Complaint Update Schemas
class ComplaintUpdateResponse(BaseModel):
    id: int
    complaint_id: str
    previous_status: str
    new_status: str
    updated_by: str
    comment: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    category: str
    problem_type: str
    location: str
    description: str
    photo_data: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintStatusUpdate(BaseModel):
    status: str # 'Pending', 'Assigned', 'In Progress', 'Resolved'
    assigned_to: Optional[str] = None
    comment: Optional[str] = None
    priority: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: str
    user_id: int
    category: str
    problem_type: str
    location: str
    description: str
    photo_data: Optional[str] = None
    priority: str
    status: str
    assigned_to: str
    latitude: float
    longitude: float
    created_at: datetime.datetime
    updated_at: datetime.datetime
    updates: List[ComplaintUpdateResponse] = []

    class Config:
        from_attributes = True

# Survey Response Schemas
class SurveyAnalyticsResponse(BaseModel):
    total_responses: int
    q1_regular_water: dict
    q2_summer_shortage: dict
    q3_main_source: dict
    q6_drainage_maintenance: dict
    q7_stagnant_water: dict
    q8_drain_cleaning: dict
    q9_mosquito_problems: dict
    q10_flooding: dict
    q11_garbage_collection: dict
    q12_suggestion: dict
    key_findings: List[str]

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    complaint_id: Optional[str] = None
    title: str
    message: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Awareness Schemas
class AwarenessResponse(BaseModel):
    id: int
    category: str
    title: str
    description: str
    tips: List[str]
    icon_name: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class ResidentStatsResponse(BaseModel):
    water_supply_status: str
    active_water_reports: int
    drainage_issues: int
    stagnant_water_reports: int
    total_my_complaints: int
    my_resolved_complaints: int

class AdminStatsResponse(BaseModel):
    total_reports: int
    water_issues: int
    drainage_issues: int
    stagnant_water_issues: int
    garbage_issues: int
    resolved_count: int
    pending_count: int
    in_progress_count: int
    assigned_count: int
    critical_count: int
    reports_by_type: dict
    complaint_status_distribution: dict
    priority_distribution: dict
    weekly_trend: List[dict]
