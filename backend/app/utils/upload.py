import uuid
from pathlib import Path

import magic
from fastapi import UploadFile, HTTPException
from ..config import get_settings

ALLOWED_IMAGE_MIMES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
BLOCKED_EXTENSIONS = {".php", ".py", ".sh", ".exe", ".bat", ".cmd", ".js", ".html"}


async def save_upload(file: UploadFile, content_type: str = "general", filename: str = None) -> str:
    settings = get_settings()
    max_size = settings.max_upload_size_mb * 1024 * 1024

    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.max_upload_size_mb}MB")

    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext in BLOCKED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")

    detected_mime = magic.from_buffer(content, mime=True)
    if detected_mime not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {detected_mime}")

    if ext not in ALLOWED_EXTENSIONS:
        mime_to_ext = {
            "image/jpeg": ".jpg", "image/png": ".png",
            "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg"
        }
        ext = mime_to_ext.get(detected_mime, ".bin")

    if filename:
        fname = filename
    else:
        fname = f"{uuid.uuid4().hex}{ext}"
    upload_dir = Path(settings.upload_dir) / content_type
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / fname
    with open(file_path, "wb") as f:
        f.write(content)

    return f"/uploads/{content_type}/{fname}"
