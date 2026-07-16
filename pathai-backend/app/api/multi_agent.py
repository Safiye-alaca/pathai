import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Modüler veritabanı ve servis katmanlarımızı import ediyoruz
from app.core.database import get_db
from app.schemas.agent_schemas import MultiAgentOrchestratorResponse
from app.services.gemini_service import run_orchestration, normalize_text

router = APIRouter(
    prefix="/api/multi-agent",
    tags=["Multi-Agent Simulation"]
)

# Çevre değişkenlerinden Mock modunu okuyoruz
MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() == "true"

@router.get("/simulate", response_model=MultiAgentOrchestratorResponse)
def simulate_multi_agent(
    project_title: str,
    sector: str,
    lang: str = "tr",
    db: Session = Depends(get_db)
):
    """
    Next.js frontend uygulamasının çağırdığı ana simülasyon endpoint'i.
    Tüm iş mantığı servis katmanına (gemini_service) delege edilmiştir.
    """
    try:
        # 1. İstek parametrelerini normalize et
        normalized_title = normalize_text(project_title)
        
        # 2. Orkestrasyon servisini çalıştır ve sonucu dön
        report_data = run_orchestration(
            project_title=normalized_title,
            sector=sector,
            lang=lang,
            mock_mode=MOCK_MODE
        )
        
        return report_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))