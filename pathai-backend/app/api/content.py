from fastapi import APIRouter, HTTPException
from app.schemas.agent_schemas import MediumResponse
from app.services.gemini_service import run_medium_strategy

router = APIRouter(prefix="/api", tags=["Content Assistant"])

@router.get("/content-assistant", response_model=MediumResponse)
def get_medium_strategy(topic: str, lang: str = "tr"):
    """
    Belirtilen teknik konu başlığı için makale iskeleti, 
    dikkat çekici başlıklar ve etiket önerileri üretir.
    """
    try:
        return run_medium_strategy(topic=topic, lang=lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))