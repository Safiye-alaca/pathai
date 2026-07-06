import os
import json
from typing import List
import requests
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
# 3. VERİ ŞEMALARI (PYDANTIC BASEMODELS)
# =====================================================================

# --- 1. Gün: Sektörel Proje Önerisi Şemaları ---
class ProjectSuggestion(BaseModel):
    title: str          
    description: str    
    difficulty: str     
    why_this: str       

class SectorProjectResponse(BaseModel):
    sector: str         
    projects: List[ProjectSuggestion]

# --- 2. Gün: Yol Haritası ve Mimari Şemaları ---
class ArchitectureComponent(BaseModel):
    layer: str          
    technology: str     
    reason: str         

class RoadmapDay(BaseModel):
    day_number: int     
    topic: str          
    tasks: List[str]    

class ProjectProjectRoadmapResponse(BaseModel):
    project_title: str
    architecture_stack: List[ArchitectureComponent]
    learning_roadmap: List[RoadmapDay]

# --- 3. Gün: GitHub & Hugging Face Radarı Şemaları ---
class TechRadarItem(BaseModel):
    name: str           # Repo veya Model adı
    url: str            # Erişim linki
    description: str    # Ne işe yaradığına dair kısa Türkçe açıklama
    metric: str         # Yıldız sayısı veya indirilme miktarı bilgi metni

class TechRadarResponse(BaseModel):
    github_trending: List[TechRadarItem]
    huggingface_trending: List[TechRadarItem]


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


# [3. GÜN ENDPOINT'İ]: Canlı verileri çekip özetleyen GitHub & Hugging Face Radarı
@app.get("/api/radar")
def get_tech_radar():
    try:
        # 1. GitHub API'sinden yapay zeka (AI) tabanlı en popüler repoları çekiyoruz
        github_url = "https://api.github.com/search/repositories?q=topic:artificial-intelligence+sort:stars&per_page=3"
        headers = {"Accept": "application/vnd.github.v3+json"}
        gh_response = requests.get(github_url, headers=headers).json()
        
        gh_items = []
        for repo in gh_response.get("items", []):
            gh_items.append(
                TechRadarItem(
                    name=repo["full_name"],
                    url=repo["html_url"],
                    description=repo["description"] if repo["description"] else "Açıklama yok.",
                    metric=f"⭐ {repo['stargazers_count']} Yıldız"
                )
            )

        # 2. Hugging Face API'sinden en popüler 3 trend modeli çekiyoruz
        hf_url = "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=3"
        hf_response = requests.get(hf_url).json()
        
        hf_items = []
        for model in hf_response:
            hf_items.append(
                TechRadarItem(
                    name=model["modelId"],
                    url=f"https://huggingface.co/{{model['modelId']}}",
                    description=f"Model Tipi: {{model.get('pipeline_tag', 'Bilinmiyor')}}",
                    metric=f"📥 {model.get('downloads', 0)} İndirilme"
                )
            )

        # 3. Elde ettiğimiz bu canlı verileri, yapay zekaya (Gemini) göndererek Türkçe analiz ettiriyoruz
        analysis_prompt = f"""
        Aşağıda GitHub ve Hugging Face platformlarından çekilmiş canlı popüler teknoloji verileri yer almaktadır:
        GitHub Verileri: {json.dumps([item.dict() for item in gh_items])}
        Hugging Face Verileri: {json.dumps([item.dict() for item in hf_items])}
        
        Lütfen bu repoların ve modellerin ne işe yaradığını analiz et ve her birinin açıklama (description) kısmını teknik ama anlaşılır tamamen TÜRKÇE bir dille yeniden yazarak şemaya uygun şekilde dön.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=analysis_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TechRadarResponse,
                temperature=0.3
            ),
        )
        return json.loads(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))