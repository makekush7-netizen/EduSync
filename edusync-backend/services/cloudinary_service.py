import cloudinary
import cloudinary.uploader
from config import settings

# File extension -> Cloudinary resource_type mapping
_RESOURCE_TYPES = {
    # Raw / documents — must use "raw" so Cloudinary serves them for download
    ".pdf": "raw",
    ".doc": "raw",
    ".docx": "raw",
    ".xls": "raw",
    ".xlsx": "raw",
    ".ppt": "raw",
    ".pptx": "raw",
    ".txt": "raw",
    ".zip": "raw",
    # Images
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".webp": "image",
    ".svg": "image",
    # Videos
    ".mp4": "video",
    ".mov": "video",
    ".avi": "video",
    ".mkv": "video",
    ".webm": "video",
}

def _get_resource_type(filename: str) -> str:
    """Determine Cloudinary resource_type from file extension."""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return _RESOURCE_TYPES.get(ext, "auto")


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
        resource_type = _get_resource_type(filename)

        upload_options = {
            "folder": folder,
            "resource_type": resource_type,
            "public_id": filename,
        }

        # For raw files (PDFs, docs), add attachment flag so browser downloads them
        if resource_type == "raw":
            upload_options["flags"] = "attachment"

        result = cloudinary.uploader.upload(file_bytes, **upload_options)
        return result["secure_url"]
