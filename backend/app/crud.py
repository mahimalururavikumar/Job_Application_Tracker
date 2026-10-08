from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from typing import Optional, List, Dict
from datetime import date, datetime
from app.models import User, JobApplication
from app import schemas, auth

# User operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: schemas.UserRegister) -> User:
    hashed_pwd = auth.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Job Application operations
def get_applications(
    db: Session,
    user_id: int,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "date_applied",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 50
) -> Dict:
    query = db.query(JobApplication).filter(JobApplication.user_id == user_id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                JobApplication.company.ilike(search_filter),
                JobApplication.role.ilike(search_filter),
                JobApplication.notes.ilike(search_filter),
                JobApplication.location.ilike(search_filter)
            )
        )

    if status and status != "All":
        query = query.filter(JobApplication.status == status)

    # Sorting
    sort_column = getattr(JobApplication, sort_by, JobApplication.date_applied)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    total = query.count()
    pages = (total + limit - 1) // limit if total > 0 else 1

    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

def get_application_by_id(db: Session, app_id: int, user_id: int) -> Optional[JobApplication]:
    return db.query(JobApplication).filter(
        JobApplication.id == app_id,
        JobApplication.user_id == user_id
    ).first()

def create_application(db: Session, app: schemas.ApplicationCreate, user_id: int) -> JobApplication:
    db_app = JobApplication(
        **app.model_dump(),
        user_id=user_id
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def update_application(
    db: Session, app_id: int, app_data: schemas.ApplicationUpdate, user_id: int
) -> Optional[JobApplication]:
    db_app = get_application_by_id(db, app_id, user_id)
    if not db_app:
        return None

    update_dict = app_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(db_app, field, value)

    db_app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_app)
    return db_app

def delete_application(db: Session, app_id: int, user_id: int) -> bool:
    db_app = get_application_by_id(db, app_id, user_id)
    if not db_app:
        return False
    db.delete(db_app)
    db.commit()
    return True

# Analytics
def get_analytics_summary(db: Session, user_id: int) -> Dict:
    apps = db.query(JobApplication).filter(JobApplication.user_id == user_id).all()
    total_apps = len(apps)

    # Status counts initialization
    statuses = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"]
    status_counts = {s: 0 for s in statuses}
    for app in apps:
        if app.status in status_counts:
            status_counts[app.status] += 1
        else:
            status_counts[app.status] = 1

    # Response & Interview Rate
    responses = status_counts["Interview"] + status_counts["Offer"] + status_counts["Rejected"]
    response_rate = round((responses / total_apps * 100), 1) if total_apps > 0 else 0.0
    interview_rate = round(((status_counts["Interview"] + status_counts["Offer"]) / total_apps * 100), 1) if total_apps > 0 else 0.0

    # Overdue follow ups (status != Offer and != Rejected, and follow_up_date < today)
    today = date.today()
    overdue_count = sum(
        1 for app in apps 
        if app.follow_up_date and app.follow_up_date < today and app.status not in ["Offer", "Rejected"]
    )

    # Monthly trends (group by Month Year formatted)
    monthly_dict: Dict[str, int] = {}
    for app in apps:
        month_str = app.date_applied.strftime("%b %Y")
        monthly_dict[month_str] = monthly_dict.get(month_str, 0) + 1

    monthly_trend = [
        {"month": month, "count": count} for month, count in monthly_dict.items()
    ]

    return {
        "total_applications": total_apps,
        "status_counts": status_counts,
        "response_rate": response_rate,
        "interview_rate": interview_rate,
        "overdue_follow_ups": overdue_count,
        "monthly_trend": monthly_trend
    }
