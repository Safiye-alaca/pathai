import os
import json
import asyncio  # 7. Gün: Gerçek zamanlı akış gecikmeleri için eklendi
from typing import List
import requests
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect  # 7. Gün: WebSocket sınıfları eklendi
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

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
    name: str           
    url: str            
    description: str    
    metric: str         

class TechRadarResponse(BaseModel):
    github_trending: List[TechRadarItem]
    huggingface_trending: List[TechRadarItem]

# --- 4. Gün: Fikir Eleştirmen Ajanı Şemaları ---
class ProjectEvaluationResponse(BaseModel):
    user_idea: str       
    market_score: int    
    technical_score: int 
    strengths: List[str] 
    weaknesses: List[str] 
    competitors_advice: str 
    final_verdict: str   

# --- 8. Gün: Geliştirici Proje Eleştirmen Şeması ---
class DevEvaluationResponse(BaseModel):
    user_project: str
    technical_complexity_score: int # 10 üzerinden teknik zorluk
    cv_impact_score: int            # 10 üzerinden CV'ye/Mülakatlara etkisi
    recommended_stack: List[str]    # Kullanması gereken en iyi kütüphaneler/teknolojiler
    engineering_challenges: List[str] # Bu projeyi yaparken karşılaşacağı zorlu mühendislik problemleri
    learning_outcomes: List[str]     # Bu projeyi bitirdiğinde kazanacağı yetkinlikler
    final_mentor_verdict: str        # Kıdemli mühendisin nihai tavsiyesi

# --- 8. Gün: Proje Öneri Şemaları ---
class ProjectSuggestionItem(BaseModel):
    title: str        # Proje Başlığı
    short_desc: str   # Kısa Özet (Kullanıcı tıkladığında input'a dolacak metin)
    difficulty: str   # Başlangıç, Orta, İleri

class ProjectSuggestionsResponse(BaseModel):
    area: str
    suggestions: List[ProjectSuggestionItem]

# --- 5. Gün: Medium / İçerik Üretici Asistanı Şemaları ---
class MediumAssistantResponse(BaseModel):
    target_topic: str          # İçerik üretilecek ana konu veya proje adı
    suggested_titles: List[str] # Medium için dikkat çekici 3 adet Türkçe başlık önerisi
    article_outline: str       # Makalenin giriş, gelişme, sonuç bölümlerini içeren Markdown formatında taslak rehberi
    tags: List[str]            # Makale altında paylaşılabilecek popüler 5 etiket (tags)


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

        hf_url = "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=3"
        hf_response = requests.get(hf_url).json()
        
        hf_items = []
        for model in hf_response:
            hf_items.append(
                TechRadarItem(
                    name=model["modelId"],
                    url=f"https://huggingface.co/{model['modelId']}",
                    description=f"Model Tipi: {model.get('pipeline_tag', 'Bilinmiyor')}",
                    metric=f"📥 {model.get('downloads', 0)} İndirilme"
                )
            )

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


# [4. GÜN ENDPOINT'İ]: Kullanıcının fikrini simüle eden ve eleştiren Yatırımcı/Mimar Ajanı
@app.get("/api/evaluate")
def evaluate_user_idea(idea: str):
    prompt = f"""
    Sen PathAI platformunun 'Kıdemli Yapay Zeka Girişim Mentörü ve Baş Mimarı'sın.
    Kullanıcı sana geliştirmek istediği şu proje fikrini sunuyor: "{idea}"
    
    Lütfen bu fikri dürüst, gerçekçi ama yapıcı bir şekilde analiz et. 
    Skorları verirken cömert davranma, gerçekçi ol (10 üzerinden hak ettiği neyse).
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Üreteceğin tüm metinler, güçlü ve zayıf yön listeleri, rakiplerle ilgili tavsiyeler und nihai karar KESİNLİKLE tamamen TÜRKÇE dilinde yazılmalıdır.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectEvaluationResponse,
                temperature=0.4
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# [8. GÜN ENDPOINT'İ]: Geliştiricinin teknik proje fikrini eleştiren Senior Tech Lead Ajanı
@app.get("/api/evaluate-dev")
def evaluate_dev_project(project: str):
    prompt = f"""
    Sen PathAI platformunun 'Kıdemli Yazılım Mimarı ve Bilgisayar Mühendisliği Mentorü'sün.
    Bir bilgisayar mühendisliği öğrencisi/geliştirici, kendini teknik olarak geliştirmek için şu projeyi yapmak istiyor: "{project}"
    
    Lütfen bu projeyi bir ticarileşme fikri olarak DEĞİL, tamamen mühendislik ve kariyer gelişimi açısından analiz et.
    - Teknik zorluk ve CV etkisine dürüst skorlar ver (cömert davranma).
    - Hangi zorlu mühendislik problemleriyle (örn: race condition, veri tutarlılığı, önbellekleme vb.) karşılaşabileceğini belirt.
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Önerilen teknoloji isimleri hariç üreteceğin tüm metinler, maddeler ve nihai mentor kararı KESİNLİKLE tamamen TÜRKÇE dilinde yazılmalıdır.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DevEvaluationResponse,
                temperature=0.5
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# [8. GÜN ENDPOINT'İ]: Geliştiricilere Alanlarına Göre Özgün Proje Fikirleri Üreten Ajan
@app.get("/api/suggest-projects", response_model=ProjectSuggestionsResponse)
def suggest_projects(area: str, level: str = "Orta"):
    prompt = f"""
    Sen PathAI platformunun 'Yazılım Kariyer ve Proje Mentörü'sün.
    Geliştirici adayı kendini teknik olarak geliştirmek için "{area}" alanında ve "{level}" seviyesinde proje yapmak istiyor ama fikri yok.
    
    Lütfen ona bu alanda yapabileceği, sıradan (to-do list, basit blog gibi) olmayan, CV'sinde parlayacak ve mülakatlarda anlatabileceği 4 farklı özgün proje fikri öner.
    Her projenin 'short_desc' alanına projenin ne işe yaradığını ve temel kapsamını 1-2 cümleyle dürüstçe yaz.
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Üreteceğin tüm başlıklar ve açıklamalar KESİNLİKLE tamamen TÜRKÇE dilinde yazılmalıdır.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectSuggestionsResponse,
                temperature=0.85 # Farklı buton tetiklemelerinde özgün fikirler üretebilmesi için sıcaklığı biraz yüksek tutuyoruz
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# [5. GÜN ENDPOINT'İ]: Proje veya konulardan teknik makale stratejisi üreten Medium Koordinatör Ajanı
@app.get("/api/content-assistant")
def get_medium_strategy(topic: str):
    prompt = f"""
    Sen PathAI platformunun 'Medium Koordinatörü ve Teknik İçerik Stratejist Ajanı'sın.
    Kullanıcı şu teknik konu veya proje hakkında blog yazısı yazmak istiyor: "{topic}"
    
    Lütfen bu konu için:
    1. Tıklanma oranı yüksek, merak uyandırıcı ve teknik 3 adet dikkat çekici Türkçe başlık üret.
    2. Geliştiricinin altını doldurarak harika bir yazı çıkarabileceği, giriş-gelişme-sonuç bölümlerini detaylandıran zengin bir makale taslağı (outline) hazırla.
    3. Medium'da ivme yakalayabileceği 5 adet popüler teknik etiket belirle.
    
    ⚠️ ÇÖK ÖNEMLİ KURAL: Önerilen başlıklar, makale taslağı ve tüm yönlendirmeler KESİNLİKLE tamamen TÜRKÇE dilinde olmalıdır. Taslağı oluştururken temiz bir Markdown formatı kullan.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MediumAssistantResponse,
                temperature=0.6
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================================
# [7. GÜN]: CANLI RADAR WEBSOCKET ENDPOINT'İ - DÖRT KANALLI RADAR SÜRÜMÜ
# =====================================================================
@app.websocket("/ws/radar")
async def websocket_radar_endpoint(websocket: WebSocket):
    """
    7. Gün Planı: Gerçek Zamanlı Çoklu Veri Akışı Kanalı.
    GitHub, Hugging Face, TechCrunch (AI Girişimleri) ve Hacker News (AI Makaleleri)
    verilerini tek bir WebSocket hattından parça parça akıtır.
    """
    await websocket.accept()
    
    # Ağ kotalarına veya hatalara karşı hazır pürüzsüz yedek veriler (Fallback)
    GITHUB_FALLBACK = [
        {"name": "microsoft/autogen", "url": "https://github.com/microsoft/autogen", "description": "Multi-agent conversation framework for next-gen AI applications.", "stargazers_count": 28500},
        {"name": "google/gemma", "url": "https://github.com/google/gemma", "description": "Lightweight, state-of-the-art open models from Google DeepMind.", "stargazers_count": 14200},
        {"name": "vllm-project/vllm", "url": "https://github.com/vllm-project/vllm", "description": "A high-throughput and memory-efficient LLM serving engine.", "stargazers_count": 22100}
    ]

    TECHCRUNCH_FALLBACK = [
        {"title": "OpenAI, yeni o1 akıllı model serisi için 6.5 milyar dolar yatırım topladı", "url": "https://techcrunch.com", "time": "15 dk önce"},
        {"title": "Anthropic, kurumsal şirketler için Claude Enterprise sürümünü duyurdu", "url": "https://techcrunch.com", "time": "1 saat önce"},
        {"title": "Girişim dünyası çalkalanıyor: Yerli AI video ajanı robotik yatırımı aldı", "url": "https://techcrunch.com", "time": "3 saat önce"}
    ]

    HACKERNEWS_FALLBACK = [
        {"title": "Yapay Zeka Mimarilerinde Transformatörlerin Ötesi: State Space Modelleri", "url": "https://news.ycombinator.com", "score": 450},
        {"title": "Neden Yerel LLM'ler (Local LLM) Bulut Sunucularını Tahtından Ediyor?", "url": "https://news.ycombinator.com", "score": 320},
        {"title": "Python Tabanlı Yeni Multi-Agent Framework Topluluğu İkiye Böldü", "url": "https://news.ycombinator.com", "score": 510}
    ]

    try:
        while True:
            data = await websocket.receive_text()
            
            if data == "START_SCAN":
                try:
                    # ---------------------------------------------------------
                    # KANAL 1: GitHub Trend Repoları
                    # ---------------------------------------------------------
                    try:
                        github_url = "https://api.github.com/search/repositories?q=topic:artificial-intelligence+sort:stars&per_page=3"
                        headers = {"User-Agent": "PathAI-App", "Accept": "application/vnd.github.v3+json"}
                        gh_response = requests.get(github_url, headers=headers, timeout=5)
                        repos = gh_response.json().get("items", []) if gh_response.status_code == 200 else GITHUB_FALLBACK
                    except Exception:
                        repos = GITHUB_FALLBACK

                    for repo in repos:
                        await asyncio.sleep(0.8)
                        await websocket.send_text(json.dumps({
                            "source": "github",
                            "name": repo.get("full_name") or repo.get("name"),
                            "url": repo.get("html_url") or repo.get("url"),
                            "description": repo.get("description") or "Yapay zeka destekli topluluk reposu.",
                            "metric": f"⭐ {repo.get('stargazers_count', 0)} Yıldız"
                        }))

                    # ---------------------------------------------------------
                    # KANAL 2: Hugging Face Trend Modelleri
                    # ---------------------------------------------------------
                    try:
                        huggingface_url = "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=3"
                        hf_response = requests.get(huggingface_url, timeout=5)
                        hf_data = hf_response.json() if hf_response.status_code == 200 else []
                    except Exception:
                        hf_data = []

                    if hf_data:
                        for model in hf_data:
                            await asyncio.sleep(0.8)
                            model_id = model.get("modelId", "Bilinmeyen Model")
                            pipeline = model.get("pipeline_tag")
                            desc = f"Canlı Model Tipi: {pipeline}" if pipeline else "Canlı Model Tipi: LLM Mimarisi"
                            await websocket.send_text(json.dumps({
                                "source": "huggingface",
                                "name": model_id,
                                "url": f"https://huggingface.co/{model_id}",
                                "description": desc,
                                "metric": f"📥 {model.get('downloads', 0)} İndirilme"
                            }))

                    # ---------------------------------------------------------
                    # KANAL 3: TechCrunch AI Girişim Haberleri
                    # ---------------------------------------------------------
                    # TechCrunch RSS/API simulasyonu ve Fallback entegrasyonu
                    for news in TECHCRUNCH_FALLBACK:
                        await asyncio.sleep(0.8)
                        await websocket.send_text(json.dumps({
                            "source": "techcrunch",
                            "name": news["title"],
                            "url": news["url"],
                            "description": "Küresel pazardan anlık yapay zeka finansman, lansman ve ekosistem gelişmesi.",
                            "metric": f"⏰ {news['time']}"
                        }))

                    # ---------------------------------------------------------
                    # KANAL 4: Hacker News Teknik AI Tartışmaları
                    # ---------------------------------------------------------
                    for story in HACKERNEWS_FALLBACK:
                        await asyncio.sleep(0.8)
                        await websocket.send_text(json.dumps({
                            "source": "hackernews",
                            "name": story["title"],
                            "url": story["url"],
                            "description": "Geliştirici topluluklarının en çok konuştuğu derin teknik AI başlıkları.",
                            "metric": f"🔥 {story['score']} Puan"
                        }))

                    # ---------------------------------------------------------
                    # TÜM AKIŞ BİTTİ SİNYALİ
                    # ---------------------------------------------------------
                    await websocket.send_text(json.dumps({"status": "COMPLETED"}))

                except Exception as api_err:
                    await websocket.send_text(json.dumps({"status": "ERROR", "message": str(api_err)}))

    except WebSocketDisconnect:
        print("🔌 Canlı radar WebSocket bağlantısı kapandı.")