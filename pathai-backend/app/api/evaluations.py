from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.core.database import get_db, EvaluationHistory
from app.schemas.agent_schemas import ProjectEvaluationResponse, DevEvaluationResponse
from app.services.gemini_service import run_idea_evaluation, run_dev_evaluation

router = APIRouter(prefix="/api", tags=["Evaluations & History"])

@router.get("/evaluate", response_model=ProjectEvaluationResponse)
def evaluate_idea(idea: str, lang: str = "tr", db: Session = Depends(get_db)):
    """Kullanıcının sunduğu girişim fikrini pazar, teknik ve rekabet açısından analiz eder ve veritabanına kaydeder."""
    try:
        ai_data = run_idea_evaluation(idea=idea, lang=lang)
        
        # Analizi geçmiş tablosuna kaydediyoruz (11. Gün Hafızası)
        db_record = EvaluationHistory(
            mode="startup",
            user_input=idea,
            ai_response=json.dumps(ai_data)
        )
        db.add(db_record)
        db.commit()
        
        return ai_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evaluate-dev", response_model=DevEvaluationResponse)
def evaluate_dev_project(project: str, lang: str = "tr", db: Session = Depends(get_db)):
    """Bilgisayar mühendisliği öğrencisi veya geliştiricinin projesini kariyer ve CV etkisi açısından mentor olarak inceler."""
    try:
        ai_data = run_dev_evaluation(project=project, lang=lang)
        
        # Analizi geçmiş tablosuna kaydediyoruz (11. Gün Hafızası)
        db_record = EvaluationHistory(
            mode="dev",
            user_input=project,
            ai_response=json.dumps(ai_data)
        )
        db.add(db_record)
        db.commit()
        
        return ai_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evaluation-history")
def get_evaluation_history(db: Session = Depends(get_db)):
    """Kullanıcının geçmişte yaptığı tüm girişim ve mühendislik değerlendirme kayıtlarını listeler."""
    try:
        records = db.query(EvaluationHistory).order_by(EvaluationHistory.created_at.desc()).all()
        
        formatted_records = []
        for r in records:
            try:
                ai_response_parsed = json.loads(r.ai_response)
            except Exception:
                ai_response_parsed = r.ai_response

            formatted_records.append({
                "id": r.id,
                "mode": r.mode,
                "user_input": r.user_input,
                "ai_response": ai_response_parsed,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return formatted_records
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))