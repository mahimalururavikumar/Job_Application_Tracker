from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud, auth
from app.models import User

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=schemas.AnalyticsSummary)
def get_analytics(
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_analytics_summary(db=db, user_id=current_user.id)
