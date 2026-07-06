import os
import json
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Ortam Değişkenlerini ve Yapay Zeka İstemcisini Yüklüyoruz
load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. FastAPI Uygulamasını ve Güvenlik (CORS) Ayarlarını Başlatıyoruz
app = FastAPI(title="PathAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# 3. VERİ ŞEMALARI (PYDANTIC BASEMODELS) - TÜRKÇE KLAVUZLU ŞEMALAR
# =====================================================================

# --- 1. Gün: Sektörel Proje Önerisi Şemaları ---
class ProjectSuggestion(BaseModel):
    title: str          # Üretilecek projenin Türkçe adı
    description: str    # Projenin Türkçe kısa özeti
    difficulty: str     # Zorluk Seviyesi (Başlangıç, Orta, İleri)
    why_this: str       # Bu projenin o sektöre neden uygun olduğunun Türkçe açıklaması

class SectorProjectResponse(BaseModel):
    sector: str         # Sorgulanan sektör adı
    projects: List[ProjectSuggestion]


# --- 2. Gün: Yol Haritası ve Mimari Şemaları ---
class ArchitectureComponent(BaseModel):
    layer: str          # Katman adı (Örn: Veri Toplama, Backend, Yapay Zeka Katmanı)
    technology: str     # Kullanılacak teknoloji (Örn: Next.js, FastAPI, PostgreSQL)
    reason: str         # Bu teknolojinin neden seçildiğinin Türkçe mimari açıklaması

class RoadmapDay(BaseModel):
    day_number: int     # Kaçıncı gün olduğu (1, 2, 3, 4, 5)
    topic: str          # O gün öğrenilmesi/yapılması gereken ana konu (Türkçe)
    tasks: List[str]    # O günün pratik görev listesi (Türkçe)

class ProjectProjectRoadmapResponse(BaseModel):
    project_title: str
    architecture_stack: List[ArchitectureComponent]
    learning_roadmap: List[RoadmapDay]


# =====================================================================
# 4. API ENDPOINTS (AKILLI SERVİS KATMANLARI)
# =====================================================================

# [1. GÜN ENDPOINT'İ]: Sektör bazlı proje fikirleri üreten servis
@app.get("/api/projects/{sector}")
def get_sector_projects(sector: str):
    prompt = f"""
    Sen kıdemli bir Yapay Zeka ve Veri Bilimi Mentorüsün. 
    Kullanıcı '{sector}' sektörü için yapay zeka proje fikirleri istiyor.
    Lütfen bu sektöre katma değer sağlayacak, güncel trendlere uygun 2 adet özgün proje fikri üret.
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Üreteceğin tüm proje adları, açıklamalar, zorluk dereceleri ve gerekçeler KESİNLİKLE TÜRKÇE olmalıdır.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SectorProjectResponse,
                temperature=0.7
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# [2. GÜN ENDPOINT'İ]: Seçilen projeye özel mimari ve yol haritası çıkaran Ajan servisi
@app.get("/api/roadmap/{project_title}")
def get_project_roadmap(project_title: str):
    prompt = f"""
    Sen PathAI platformunun 'Kariyer ve Yazılım Mimarı Ajanı'sın.
    Kullanıcı '{project_title}' isimli yapay zeka/veri bilimi projesini geliştirmek istiyor.
    
    Lütfen bu proje için:
    1. Üretim ortamına uygun (production-ready) 3 temel mimari bileşen öner ve nedenlerini açıkla.
    2. Kullanıcının bu projeyi sıfırdan yapabilmesi için 5 günlük, mantıklı ve adımlı bir öğrenme/geliştirme yol haritası çıkar.
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Yanıttaki katman isimleri (layer), teknolojiler hariç tüm açıklamalar (reason), ana konular (topic) ve görevler (tasks) KESİNLİKLE tamamen TÜRKÇE dilinde yazılmalıdır. İngilizce metin üretme.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectProjectRoadmapResponse,
                temperature=0.5
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))