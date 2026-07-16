from fastapi import APIRouter, HTTPException
from app.schemas.agent_schemas import ProjectProjectRoadmapResponse
from app.services.gemini_service import run_roadmap_generation

router = APIRouter(prefix="/api", tags=["Roadmaps"])

@router.get("/roadmap/{project_title}", response_model=ProjectProjectRoadmapResponse)
def get_project_roadmap(project_title: str, lang: str = "tr"):
    """Seçilen proje başlığı için teknoloji yığını ve 5 günlük detaylı geliştirme yol haritası sunar."""
    try:
        return run_roadmap_generation(project_title=project_title, lang=lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))