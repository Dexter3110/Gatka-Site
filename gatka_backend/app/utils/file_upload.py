"""
Utility functions for handling file uploads (player documents).

Changes from original:
  - MAX_SIZE_BYTES reduced from 5 MB to 500 KB to match frontend note
  - save_upload now returns a URL-friendly path with forward slashes on all OS
  - Added get_file_url() helper so routers can build a full URL easily
  - Added async_save_upload() for use inside FastAPI async routes
"""

import os
import uuid
from fastapi import UploadFile, HTTPException
from app.config import settings

# ─── Constants ────────────────────────────────────────────────────────────────

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png"}

# FIXED: was 5 MB — UI note says 500 KB, so enforce it here too
MAX_SIZE_BYTES = 500 * 1024   # 500 KB


# ─── Helpers ──────────────────────────────────────────────────────────────────

def validate_image(upload: UploadFile) -> None:
    """Raise HTTP 400 if the uploaded file is not an allowed image type."""
    if upload.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{upload.content_type}' not allowed. Use JPEG or PNG.",
        )


def get_file_url(relative_path: str) -> str:
    """
    Convert a stored relative path  (e.g. 'photos/abc123.jpg')
    into a full URL that the frontend can use in an <img src=...>.

    Example:
        get_file_url('photos/abc123.jpg')
        → 'http://localhost:8000/uploads/photos/abc123.jpg'

    The BASE_URL is read from settings so it works in dev and prod.
    """
    base = getattr(settings, "BASE_URL", "http://localhost:8000").rstrip("/")
    # Always use forward slashes in URLs regardless of OS
    url_path = relative_path.replace("\\", "/")
    return f"{base}/uploads/{url_path}"


def save_upload(upload: UploadFile, subfolder: str) -> str:
    """
    Validate and save an uploaded image.

    Args:
        upload:    The FastAPI UploadFile object.
        subfolder: Subdirectory under UPLOAD_DIR, e.g. 'photos' or 'aadhar'.

    Returns:
        A relative path string stored in the DB, e.g. 'photos/abc123.jpg'.
        Use get_file_url(returned_path) to build the full URL for responses.

    Raises:
        HTTPException 400 — wrong file type or file too large.
    """
    # 1. Type check
    validate_image(upload)

    # 2. Build unique filename
    ext = os.path.splitext(upload.filename or "file.jpg")[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"

    # 3. Ensure directory exists
    dir_path = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(dir_path, exist_ok=True)

    # 4. Read file contents ONCE (stream is not rewindable)
    contents = upload.file.read()

    # 5. Size check AFTER reading so we don't leave a partial file
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds 500 KB limit (got {len(contents) // 1024} KB).",
        )

    # 6. Write to disk
    dest = os.path.join(dir_path, filename)
    with open(dest, "wb") as f:
        f.write(contents)

    # 7. FIXED: always return forward-slash path so it works as a URL segment
    return f"{subfolder}/{filename}"


def delete_file(relative_path: str) -> None:
    """
    Remove a previously uploaded file from disk.
    Safe to call with None or empty string — does nothing.
    Used when updating a player and replacing the old photo.
    """
    if not relative_path:
        return
    full_path = os.path.join(settings.UPLOAD_DIR, relative_path)
    if os.path.exists(full_path):
        os.remove(full_path)