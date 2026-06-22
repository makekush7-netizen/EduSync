from fastapi import APIRouter, Depends, UploadFile, File
from middleware.role_guard import require_role
import models
from services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(require_role(models.UserRole.teacher, models.UserRole.admin)),
):
    file_bytes = await file.read()
    url = CloudinaryService.upload_file(file_bytes, file.filename)
    return {"url": url, "filename": file.filename}