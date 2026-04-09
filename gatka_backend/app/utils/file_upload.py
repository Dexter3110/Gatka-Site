"""
Utility functions for handling file uploads (player documents).
"""

import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def validate_image(upload: UploadFile) -> None:
    if upload.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{upload.content_type}' not allowed. Use JPEG or PNG."
        )


def save_upload(upload: UploadFile, subfolder: str) -> str:
    """
    Save an uploaded file under UPLOAD_DIR/subfolder/<uuid>.<ext>
    Returns the relative path string to store in the database.
    """
    validate_image(upload)

    ext = os.path.splitext(upload.filename or "file.jpg")[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dir_path = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(dir_path, exist_ok=True)

    dest = os.path.join(dir_path, filename)
    contents = upload.file.read()

    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 5 MB limit")

    with open(dest, "wb") as f:
        f.write(contents)

    return f"{subfolder}/{filename}"


def delete_file(relative_path: str) -> None:
    """Remove a file from the upload directory (used on player update)."""
    if not relative_path:
        return
    full_path = os.path.join(settings.UPLOAD_DIR, relative_path)
    if os.path.exists(full_path):
        os.remove(full_path)
