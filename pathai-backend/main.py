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
    allow_origins=["*"],  # Geliştirme aşamasında Next.js'in rahat erişmesi için her kökene izin verdik
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Gemini'dan İstediğimiz Yapılandırılmış JSON Şemasını Tanımlıyoruz
class ProjectSuggestion(BaseModel):
    title: str          # Üretilecek projenin adı
    description: str    # Projenin ne işe yaradığı (özeti)
    difficulty: str     # Başlangıç, Orta veya İleri seviye kısıtlaması
    why_this: str       # Bu projenin o sektöre nasıl katma değer sağladığının mantığı

class SectorProjectResponse(BaseModel):
    sector: str         # Sorgulanan sektör adı
    projects: List[ProjectSuggestion] # Sektöre ait üretilen proje fikirlerinin listesi

# 4. Sektörel Proje Önerilerini Dönen Akıllı Endpoint'imiz
@app.get("/api/projects/{sector}")
def get_sector_projects(sector: str):
    # Modelin bir mentor gibi davranmasını ve sektörel odaklanmasını sağlayan yönlendirme
    prompt = f"""
    Sen kıdemli bir Yapay Zeka ve Veri Bilimi Mentorüsün. 
    Kullanıcı '{sector}' sektörü için yapay zeka proje fikirleri istiyor.
    Lütfen bu sektöre katma değer sağlayacak, güncel trendlere uygun 2 adet özgün proje fikri üret.
    """
    
    try:
        # Gemini 2.5 Flash modeline Structured Outputs (JSON Mode) emri veriyoruz
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", # Çıktı formatını JSON olarak kilitledik
                response_schema=SectorProjectResponse,  # Çıktı kalıbını Pydantic şemamıza bağladık
                temperature=0.7
            ),
        )
        
        # Gelen string formatındaki JSON yanıtını Python sözlüğüne (dict) çevirip doğrudan dönüyoruz
        return json.loads(response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))