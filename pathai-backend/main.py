import time
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# .env dosyasındaki çevre değişkenlerini yüklüyoruz
load_dotenv()

# Modüler veritabanı motorunu ve modelleri import ediyoruz
from app.core.database import engine, Base

# Modüler API Router'larımızı import ediyoruz
from app.api.multi_agent import router as multi_agent_router
from app.api.projects import router as projects_router
from app.api.roadmaps import router as roadmaps_router
from app.api.evaluations import router as evaluations_router
from app.api.content import router as content_router
from app.api.radar import router as radar_router

# Uygulama başlarken veritabanı tablolarını otomatik oluşturuyoruz
Base.metadata.create_all(bind=engine)

# Loglama Konfigürasyonu
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PathAI-Observability")

app = FastAPI(
    title="PathAI Multi-Agent Backend",
    description="Sektör standartlarında modüler katmanlı mimari ile refaktör edilmiş çoklu ajan yönetim sistemi."
)

# CORS Güvenlik Ayarları (Next.js frontend uygulamamızın erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [9. GÜN]: PERFORMANS VE İZLEME MIDDLEWARE KATMANI
@app.middleware("http")
async def audit_and_performance_logger(request, call_next):
    start_time = time.time()
    method = request.method
    path = request.url.path
    
    logger.info(f"📡 İSTEK BAŞLADI: {method} {path}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        status_code = response.status_code
        
        logger.info(f"✅ İSTEK TAMAMLANDI: {method} {path} | Durum: {status_code} | Süre: {process_time:.2f}ms")
        response.headers["X-Process-Time-MS"] = f"{process_time:.2f}"
        return response
        
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"❌ İSTEK ÇÖKTÜ: {method} {path} | Süre: {process_time:.2f}ms | Hata: {str(exc)}")
        raise exc

# Modüler API Router'larımızı FastAPI sistemine dahil ediyoruz (Register)
app.include_router(multi_agent_router)
app.include_router(projects_router)
app.include_router(roadmaps_router)
app.include_router(evaluations_router)
app.include_router(content_router)
app.include_router(radar_router)

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "PathAI Profesyonel Modüler API tıkır tıkır çalışıyor!"}