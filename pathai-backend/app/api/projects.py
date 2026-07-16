from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db, UserContext
from app.schemas.agent_schemas import SectorProjectResponse, ProjectSuggestionsResponse
from app.services.gemini_service import run_project_generation, run_suggest_projects

router = APIRouter(prefix="/api", tags=["Projects & Suggestions"])

@router.get("/projects/{sector}", response_model=SectorProjectResponse)
def get_sector_projects(sector: str, lang: str = "tr", db: Session = Depends(get_db)):
    """Kullanıcının arattığı sektöre uygun 2 özgün yapay zeka proje fikri üretir ve bağlamı kaydeder."""
    try:
        # Kullanıcı bağlamını veritabanına kaydet (15. Gün Belleği)
        context = db.query(UserContext).filter(UserContext.session_id == "default_user").first()
        if not context:
            context = UserContext(session_id="default_user", last_searched_sector=sector)
            db.add(context)
        else:
            context.last_searched_sector = sector
        db.commit()
    except Exception as db_error:
        print(f"⚠️ [MEMORY WRITE ERROR]: {str(db_error)}")

    try:
        return run_project_generation(sector=sector, lang=lang)
    except Exception as e:
        # Gemini hata verirse statik fallback verisini dönüyoruz
        fallback_data = {
            "finance": {
                "projects": [
                    {"title": "Farmance", "description": "Kişisel finans yönetimini öğreten mobil finansal okuryazarlık oyunu.", "difficulty": "Orta", "why_this": "Finansal okuryazarlığı artırmak için oyunlaştırma metodolojisi kullanır."},
                    {"title": "Mikro-Yatırım Asistanı", "description": "Küsuratları otomatik birikime dönüştüren asistan.", "difficulty": "Kolay", "why_this": "Kullanıcıların kolay birikim yapmasını sağlar."}
                ]
            },
            "e-ticaret": {
                "projects": [
                    {"title": "Tashigo", "description": "Esnaf drop-off noktaları kullanan peer-to-peer kargo lojistiği.", "difficulty": "Zor", "why_this": "Yerel lojistik ağlarını optimize eder."},
                    {"title": "Dinamik Fiyatlandırma Paneli", "description": "AI ile ürün fiyatlarını otomatik güncelleyen e-ticaret paneli.", "difficulty": "Orta", "why_this": "Talep ve rakiplere göre kârlılığı artırır."}
                ]
            }
        }
        sector_key = sector.lower()
        if sector_key in fallback_data:
            return {"sector": sector, "projects": fallback_data[sector_key]["projects"]}
            
        return {
            "sector": sector,
            "projects": [
                {"title": f"Yapay Zeka Destekli {sector} Platformu", "description": "Süreçleri yapay zeka ile optimize eden akıllı sistem.", "difficulty": "Orta", "why_this": "Sektörel verimlilik sağlar."},
                {"title": f"Akıllı {sector} Asistanı", "description": "Süreç takibi yapan LLM tabanlı asistan.", "difficulty": "Kolay", "why_this": "Kullanıcı hatalarını minimize eder."}
            ]
        }

@router.get("/suggest-projects", response_model=ProjectSuggestionsResponse)
def suggest_projects(area: str = None, level: str = "Orta", lang: str = "tr", db: Session = Depends(get_db)):
    """Kullanıcının seviyesine ve alanına göre CV'de parlayacak 4 proje önerir. Alan boşsa son aranan sektörü kullanır."""
    try:
        context = db.query(UserContext).filter(UserContext.session_id == "default_user").first()
    except Exception as db_err:
        print(f"⚠️ [MEMORY READ ERROR]: {str(db_err)}")
        context = None

    effective_area = area if area and area.strip() != "" else (context.last_searched_sector if context and context.last_searched_sector else "e-commerce")

    try:
        return run_suggest_projects(area=effective_area, level=level, lang=lang)
    except Exception as gemini_error:
        print(f"⚠️ [GEMINI FALLBACK]: {str(gemini_error)}")
        return {
            "area": effective_area,
            "suggestions": [
                {"title": f"Yapay Zeka Destekli {effective_area.capitalize()} Platformu", "short_desc": "Akıllı tahminleme aracı.", "difficulty": level},
                {"title": f"Akıllı {effective_area.capitalize()} Otomasyon Sistemi", "short_desc": "Mikroservis mimarili backend.", "difficulty": level},
                {"title": f"P2P {effective_area.capitalize()} Paylaşım Ağı", "short_desc": "Doğrudan kullanıcılar arası ağ.", "difficulty": level},
                {"title": f"Mobil {effective_area.capitalize()} Mentor Uygulaması", "short_desc": "Kişiselleştirilmiş mobil asistan.", "difficulty": level}
            ]
        }