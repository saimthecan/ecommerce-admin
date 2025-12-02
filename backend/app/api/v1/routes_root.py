from fastapi import APIRouter

router = APIRouter()


@router.get("/ping", summary="Ping endpoint (test)")
async def ping():
    return {"message": "pong"}
