# dummy code to be changed

from fastapi import APIRouter, Depends

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

# Helper function to inject and construct the service layer chain
def get_user_service():
    return "hi"

@router.get("/{user_id}")
def get_user(user_id: int):
    return user_id
