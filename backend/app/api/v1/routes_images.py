"""Routes for Image Upload."""
import os
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_admin
from app.core.config import settings
from app.crud.variant import create_image, delete_image, get_image
from app.crud.product import get_product
from app.crud.variant import get_variant
from app.schemas.variant import ImageOut

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_upload_dir() -> str:
    """Get and ensure upload directory exists."""
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


@router.post("/upload", response_model=ImageOut)
async def upload_image(
    file: UploadFile = File(...),
    product_id: UUID | None = Form(None),
    variant_id: UUID | None = Form(None),
    alt_text: str | None = Form(None),
    is_primary: bool = Form(False),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Upload an image for a product or variant."""
    if not product_id and not variant_id:
        raise HTTPException(status_code=400, detail="product_id veya variant_id gerekli.")
    
    # Validate product/variant exists
    if product_id:
        product = await get_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    
    if variant_id:
        variant = await get_variant(db, variant_id)
        if not variant:
            raise HTTPException(status_code=404, detail="Varyant bulunamadı.")
    
    # Validate file extension
    filename = file.filename or "image"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Geçersiz dosya tipi. İzin verilenler: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Read file content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Dosya boyutu 5MB'dan büyük olamaz.")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    # Check for Cloudinary configuration
    if settings.CLOUDINARY_URL:
        # TODO: Implement Cloudinary upload
        url = f"/uploads/{unique_filename}"  # Placeholder
    else:
        # Save to local filesystem
        upload_dir = get_upload_dir()
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        url = f"/uploads/{unique_filename}"
    
    # Create database record
    from app.schemas.variant import ImageCreate
    image_data = ImageCreate(
        product_id=product_id,
        variant_id=variant_id,
        url=url,
        alt_text=alt_text,
        is_primary=is_primary,
    )
    
    image = await create_image(db, image_data)
    return image


@router.delete("/{image_id}", status_code=204)
async def delete_image_endpoint(
    image_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Delete an image."""
    image = await get_image(db, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı.")
    
    # Delete file from local storage if not a URL
    if image.url.startswith("/uploads/"):
        upload_dir = get_upload_dir()
        filename = image.url.replace("/uploads/", "")
        file_path = os.path.join(upload_dir, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    await delete_image(db, image)
    return None
