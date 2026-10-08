from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import schemas, crud, auth
from app.models import User

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.get("", response_model=schemas.PaginatedApplications)
def list_applications(
    search: Optional[str] = Query(None, description="Search by company, role, or notes"),
    status: Optional[str] = Query(None, description="Filter by status (Applied, Interview, Offer, Rejected, Wishlist)"),
    sort_by: str = Query("date_applied", description="Sort field (date_applied, company, role, status)"),
    sort_order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_applications(
        db=db,
        user_id=current_user.id,
        search=search,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )

@router.post("", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: schemas.ApplicationCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_application(db=db, app=app_in, user_id=current_user.id)

@router.get("/{app_id}", response_model=schemas.ApplicationResponse)
def get_application(
    app_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    app = crud.get_application_by_id(db=db, app_id=app_id, user_id=current_user.id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access"
        )
    return app

@router.put("/{app_id}", response_model=schemas.ApplicationResponse)
def update_application(
    app_id: int,
    app_in: schemas.ApplicationUpdate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    updated = crud.update_application(db=db, app_id=app_id, app_data=app_in, user_id=current_user.id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access"
        )
    return updated

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    deleted = crud.delete_application(db=db, app_id=app_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access"
        )
    return None
