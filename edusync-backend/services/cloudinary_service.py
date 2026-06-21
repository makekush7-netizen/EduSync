import cloudinary
import cloudinary.uploader
from config import settings

class CloudinaryService:
    @staticmethod
    def configure():
        if settings.CLOUDINARY_URL:
            cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)

    @staticmethod
    def upload_file(file_bytes: bytes, filename: str, folder: str = "edusync") -> str:
        if not settings.CLOUDINARY_URL:
            # Fallback for local testing without Cloudinary
            return f"https://dummyimage.com/600x400/000/fff&text={filename}"

        CloudinaryService.configure()
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="auto",
            public_id=filename
        )
        return result["secure_url"]
