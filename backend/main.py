import csv
import io
import datetime
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Asia/Kolkata")
except Exception:
    IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30), name="IST")

import database
import models
import schemas
import auth
import crud
from seed_data import seed_database

# Initialize database schema on startup
database.Base.metadata.create_all(bind=database.engine)

# Seed initial survey and demo data
with database.SessionLocal() as db_session:
    seed_database(db_session)

app = FastAPI(
    title="Smart Water & Drainage Management System API",
    description="Offline Civic-Tech Management Platform for Ramaswami Peta, Rajanagaram",
    version="1.0.0"
)

# Enable CORS for local frontend execution
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Dependencies
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
) -> models.User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or invalid."
        )
    token = authorization.split(" ")[1]
    payload = auth.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token."
        )
    user = crud.get_user_by_id(db, user_id=int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found."
        )
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return current_user

# --- HEALTH CHECK ---
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mode": "offline",
        "project": "Smart Water & Drainage Management System",
        "location": "Ramaswami Peta, Rajanagaram, East Godavari District, AP, India"
    }

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username_or_email(db, login_data.username_or_email)
    if not user or not auth.verify_password(user.password_hash, login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password."
        )
    
    # Verify role if requested
    if login_data.role and user.role != login_data.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is registered as '{user.role}', not '{login_data.role}'."
        )
        
    access_token = auth.create_access_token(data={"sub": str(user.id), "role": user.role})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.from_orm(user)
    )

@app.post("/auth/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = crud.get_user_by_username_or_email(db, user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    existing_email = crud.get_user_by_username_or_email(db, user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )
    
    # Enforce resident registration by default
    user_in.role = "resident"
    new_user = crud.create_user(db, user_in)
    access_token = auth.create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.from_orm(new_user)
    )

# --- USER PROFILE ENDPOINTS ---
@app.get("/users/profile", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return schemas.UserResponse.from_orm(current_user)

@app.put("/users/profile", response_model=schemas.UserResponse)
def update_profile(
    update_data: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    updated = crud.update_user_profile(db, current_user, update_data)
    return schemas.UserResponse.from_orm(updated)

# --- COMPLAINT ENDPOINTS ---
@app.post("/complaints", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    comp_in: schemas.ComplaintCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    complaint = crud.create_complaint(db, comp_in, current_user.id)
    return schemas.ComplaintResponse.from_orm(complaint)

@app.get("/complaints", response_model=List[schemas.ComplaintResponse])
def list_complaints(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    my_only: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    # If user is resident or my_only is True, show only user's own complaints
    user_filter = current_user.id if (current_user.role == "resident" or my_only) else None
    complaints = crud.get_complaints(
        db=db,
        category=category,
        status=status,
        priority=priority,
        search=search,
        user_id=user_filter
    )
    return [schemas.ComplaintResponse.from_orm(c) for c in complaints]

@app.get("/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
def get_complaint(
    complaint_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    complaint = crud.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    if current_user.role == "resident" and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied to this complaint.")
    return schemas.ComplaintResponse.from_orm(complaint)

@app.put("/complaints/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_complaint_status(
    complaint_id: str,
    status_update: schemas.ComplaintStatusUpdate,
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    complaint = crud.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    updated = crud.update_complaint_status(db, complaint, status_update, admin_user.full_name)
    return schemas.ComplaintResponse.from_orm(updated)

# --- DASHBOARD STATS ---
@app.get("/dashboard/stats")
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role == "admin":
        return crud.get_admin_stats(db)
    else:
        return crud.get_resident_stats(db, current_user.id)

# --- SURVEY ANALYTICS ---
@app.get("/survey/analytics", response_model=schemas.SurveyAnalyticsResponse)
def get_survey_analytics(db: Session = Depends(database.get_db)):
    return crud.get_survey_analytics(db)

# --- AWARENESS CONTENT ---
@app.get("/awareness", response_model=List[schemas.AwarenessResponse])
def get_awareness(db: Session = Depends(database.get_db)):
    return crud.get_awareness_content(db)

# --- NOTIFICATIONS ---
@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def list_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    notifications = crud.get_user_notifications(db, current_user.id)
    return [schemas.NotificationResponse.from_orm(n) for n in notifications]

@app.put("/notifications/{notif_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read(
    notif_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    notif = crud.mark_notification_as_read(db, notif_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return schemas.NotificationResponse.from_orm(notif)

@app.put("/notifications/read-all")
def mark_all_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    crud.mark_all_notifications_as_read(db, current_user.id)
    return {"message": "All notifications marked as read."}

# --- REPORTS & EXPORT ---
@app.get("/reports/summary")
def get_reports_summary(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    complaints = crud.get_complaints(db, category=category, status=status, priority=priority)
    
    total = len(complaints)
    resolved = sum(1 for c in complaints if c.status == "Resolved")
    pending = sum(1 for c in complaints if c.status == "Pending")
    in_prog = sum(1 for c in complaints if c.status == "In Progress")
    assigned = sum(1 for c in complaints if c.status == "Assigned")
    
    cat_summary = {}
    for c in complaints:
        cat_summary[c.category] = cat_summary.get(c.category, 0) + 1
        
    return {
        "total_complaints": total,
        "resolved": resolved,
        "pending": pending,
        "in_progress": in_prog,
        "assigned": assigned,
        "resolution_rate": f"{(resolved / total * 100):.1f}%" if total > 0 else "0%",
        "category_breakdown": cat_summary,
        "complaints": [schemas.ComplaintResponse.from_orm(c) for c in complaints]
    }

@app.get("/reports/export-csv")
def export_complaints_csv(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    admin_user: models.User = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    complaints = crud.get_complaints(db, category=category, status=status, priority=priority)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Complaint ID",
        "Category",
        "Problem Type",
        "Location",
        "Priority",
        "Status",
        "Assigned To",
        "Created Date",
        "Updated Date",
        "Description"
    ])
    
    for c in complaints:
        created_ist = c.created_at.astimezone(IST) if c.created_at.tzinfo else c.created_at
        updated_ist = c.updated_at.astimezone(IST) if c.updated_at.tzinfo else c.updated_at
        writer.writerow([
            c.id,
            c.category,
            c.problem_type,
            c.location,
            c.priority,
            c.status,
            c.assigned_to,
            created_ist.strftime("%m/%d/%Y, %I:%M:%S %p IST"),
            updated_ist.strftime("%m/%d/%Y, %I:%M:%S %p IST"),
            c.description.replace("\n", " ")
        ])
        
    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=complaints_report_ramaswami_peta.csv"
        }
    )
