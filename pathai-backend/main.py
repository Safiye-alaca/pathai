import os
import json
import asyncio  # 7. Gün: Gerçek zamanlı akış gecikmeleri için eklendi
import datetime
from typing import List
import requests
import re
import time 
from pydantic import BaseModel, Field
from typing import List

# FastAPI Bileşenleri
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Google GenAI SDK
from google import genai
from google.genai import types

# SQLAlchemy Veri Tabanı Bileşenleri
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session  # <-- 11. Gün için Session burada tek seferde durmalı

# Çevre Değişkenleri
from dotenv import load_dotenv

# SQLite Veri Tabanı Bağlantı Ayarları
DATABASE_URL = "sqlite:///./pathai.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# [11. GÜN]: Kalıcı Hafıza İçin Değerlendirme Geçmişi Tablo Modeli
class EvaluationHistory(Base):
    __tablename__ = "evaluation_history"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, index=True)       # 'startup' veya 'dev'
    user_input = Column(Text)               # Kullanıcının yazdığı fikir/proje
    ai_response = Column(Text)              # Gelen JSON yanıtın metin hali
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# [15. GÜN]: Kısa/Uzun Vadeli Bellek ve Kullanıcı Bağlam Tablosu
class UserContext(Base):
    __tablename__ = "user_context"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, default="default_user") # İleride auth eklenirse ayrıştırmak için
    last_searched_sector = Column(String, nullable=True)           # En son aranan sektör (örn: finance)
    last_selected_project = Column(String, nullable=True)          # En son seçilen/yol haritası istenen proje
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Tabloları veri tabanında otomatik oluşturuyoruz
Base.metadata.create_all(bind=engine)

# [16. GÜN]: Medium Asistanı Pydantic Yanıt Şeması
class MediumResponse(BaseModel):
    target_topic: str
    suggested_titles: List[str]
    article_outline: str
    tags: List[str]

# [17. GÜN]: CTO Ajanının Teknik Çıktı Şeması
class CTOAnalysis(BaseModel):
    software_architecture: str  # Monolitik mi, mikroservis mi, serverless mı ve neden?
    database_design: str       # SQL mi, NoSQL mi, tablo/koleksiyon önerileri
    security_infrastructure: str # JWT, OAuth2, veri şifreleme ve siber güvenlik önlemleri

# [17. GÜN]: CEO/BizDev Ajanının İş Geliştirme Çıktı Şeması
class CEOAnalysis(BaseModel):
    target_audience: str       # Hedek kitle kimler (B2B, B2C, persona tanımı)
    revenue_models: List[str]  # Gelir modelleri (Abonelik, komisyon, freemium vb.)
    go_to_market_strategy: str # Pazara giriş ve büyüme stratejisi

# [20. GÜN]: Kullanıcı Personası ve Eleştirel Test Şeması
class UserPersonaAnalysis(BaseModel):
    persona_name: str = Field(description="Sanal kullanıcının adı ve soyadı veya takma adı")
    demographics: str = Field(description="Yaş, meslek, gelir düzeyi ve teknoloji kullanım alışkanlıkları")
    pain_points: List[str] = Field(description="Bu kullanıcının günlük hayatta yaşadığı ve bu ürünün çözebileceği 3 kritik problem")
    brutal_feedback: str = Field(description="Kullanıcının bu projeye yönelik acımasız, samimi ve gerçekçi eleştirisi")
    adoption_score: int = Field(description="Kullanıcının bu ürünü gerçekten kullanma ve satın alma ihtimali (1-100 arası puan)")

# [17. GÜN]: İki ajanın raporunu birleştiren Merkezi Router Şeması
class MultiAgentOrchestratorResponse(BaseModel):
    project_title: str
    cto_report: CTOAnalysis
    ceo_report: CEOAnalysis
    synergy_summary: str
    user_test: UserPersonaAnalysis # Yeni eklenen kullanıcı simülasyonu alanı

# [21. GÜN]: Ajanlar Arası Tartışma ve Uzlaşı Şemaları
class AgentDebateAnalysis(BaseModel):
    cto_criticism: str = Field(description="CTO'nun, CEO'nun iş modeline ve pazara giriş stratejisine yönelik teknik/bütçe eleştirisi")
    ceo_criticism: str = Field(description="CEO'nun, CTO'nun yazılım mimarisine yönelik süre/karmaşıklık/maliyet eleştirisi")
    mvp_consensus: str = Field(description="İki ajanın tartışarak ortak noktada buluştuğu, pazar dostu ve teknik olarak uygulanabilir nihai MVP planı")

# Ana yanıt modelini de bu yeni tartışma alanıyla genişletiyoruz
class MultiAgentOrchestratorResponse(BaseModel):
    project_title: str
    cto_report: CTOAnalysis
    ceo_report: CEOAnalysis
    synergy_summary: str
    user_test: UserPersonaAnalysis
    debate_report: AgentDebateAnalysis # [21. GÜN]: Yeni eklenen tartışma katmanı

# [18. GÜN]: Çoklu Ajan Raporları için Önbellek / Geçmiş Tablosu
class MultiAgentHistory(Base):
    __tablename__ = "multi_agent_history"

    id = Column(Integer, primary_key=True, index=True)
    # Kullanıcının girdiği orijinal ve normalize edilmiş arama başlıkları
    original_title = Column(String, nullable=False)
    normalized_title = Column(String, unique=True, index=True, nullable=False)
    sector = Column(String, nullable=False)
    
    # SQLite büyük metinleri saklayabilmek için JSON formatında tutacağız
    cto_report_json = Column(String, nullable=False)
    ceo_report_json = Column(String, nullable=False)
    synergy_summary = Column(String, nullable=False)
    
    user_test_json = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

# SQLite tablolarının otomatik oluşturulduğundan emin olmak için (dosyanın ortalarında bir yerde zaten vardır):
Base.metadata.create_all(bind=engine)

# Harf ve karakterleri standardize etme (Exact Match hazırlığı)
def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    # Türkçe karakter dönüşümleri
    replacements = {
        'ı': 'i', 'ş': 's', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ç': 'c'
    }
    for search, replace in replacements.items():
        text = text.replace(search, replace)
    # Sadece harf, rakam ve boşlukları bırak, noktalama işaretlerini temizle
    text = re.sub(r'[^a-z0-9\s]', '', text)
    # Fazla boşlukları tek boşluğa indirge
    return " ".join(text.split())

# Basit Kelime Çakışması (Jaccard Similarity) ile Semantik Yakınlık Ölçümü
def get_semantic_match(new_title: str, db_sessions) -> MultiAgentHistory:
    new_norm = normalize_text(new_title)
    new_words = set(new_norm.split())
    
    # Eğer çok kısa bir girdi ise semantik arama yapma, birebir eşleşmeye zorla
    if len(new_words) < 2:
        return db_sessions.query(MultiAgentHistory).filter(MultiAgentHistory.normalized_title == new_norm).first()
        
    all_cached = db_sessions.query(MultiAgentHistory).all()
    
    best_match = None
    highest_similarity = 0.0
    
    for record in all_cached:
        # Birebir eşleşme varsa doğrudan döndür
        if record.normalized_title == new_norm:
            return record
            
        record_words = set(record.normalized_title.split())
        if not record_words:
            continue
            
        # Jaccard Katsayısı: Kesişim / Birleşim (Ortak kelimelerin toplam benzersiz kelimelere oranı)
        intersection = new_words.intersection(record_words)
        union = new_words.union(record_words)
        similarity = len(intersection) / len(union)
        
        # Eğer iki başlığın kelime benzerliği %75'in üzerindeyse aynı proje olarak kabul et
        if similarity > 0.75 and similarity > highest_similarity:
            highest_similarity = similarity
            best_match = record
            
    if best_match:
        print(f"🎯 [SEMANTIC CACHE HIT]: '{new_title}' ifadesi '{best_match.original_title}' ile %{int(highest_similarity*100)} benzer bulundu!")
    return best_match

# Veri tabanı oturumu (session) için bağımlılık enjeksiyonu (Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

import time
import logging

# Loglama konfigürasyonunu yapıyoruz
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PathAI-Observability")

# [9. GÜN]: PERFORMANS VE LOGLAMA MIDDLEWARE KATMANI
@app.middleware("http")
async def audit_and_performance_logger(request, call_next):
    start_time = time.time()
    
    # İstek detaylarını alıyoruz
    method = request.method
    path = request.url.path
    
    logger.info(f"📡 İSTEK BAŞLADI: {method} {path}")
    
    try:
        # İsteği bir sonraki aşamaya (endpoint'e) yönlendiriyoruz
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        status_code = response.status_code
        
        # Performans çıktısını terminale basıyoruz
        logger.info(f"✅ İSTEK TAMAMLANDI: {method} {path} | Durum: {status_code} | Süre: {process_time:.2f}ms")
        
        # Yanıt süresini tarayıcı tarafında da görebilmek için header'a ekliyoruz
        response.headers["X-Process-Time-MS"] = f"{process_time:.2f}"
        return response
        
    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"❌ İSTEK ÇÖKTÜ: {method} {path} | Süre: {process_time:.2f}ms | Hata: {str(exc)}")
        raise exc

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
    technical_complexity_score: int 
    cv_impact_score: int            
    recommended_stack: List[str]    
    engineering_challenges: List[str] 
    learning_outcomes: List[str]     
    final_mentor_verdict: str        

# --- 8. Gün: Proje Öneri Şemaları ---
class ProjectSuggestionItem(BaseModel):
    title: str        
    short_desc: str   
    difficulty: str   

class ProjectSuggestionsResponse(BaseModel):
    area: str
    suggestions: List[ProjectSuggestionItem]

# --- 5. Gün: Medium / İçerik Üretici Asistanı Şemaları ---
class MediumAssistantResponse(BaseModel):
    target_topic: str          
    suggested_titles: List[str] 
    article_outline: str       
    tags: List[str]            

# --- 10. Gün: Radar Veri Özetleme Şeması ---
class RadarSummaryResponse(BaseModel):
    tldr_summary: str        
    market_opportunities: List[str] 
    architectural_trends: List[str] 

# =====================================================================
# Helper Function: Dinamik Dil Yönergesi Ekleyici
# =====================================================================
def get_language_instruction(lang: str) -> str:
    if lang == "en":
        return "⚠️ CRITICAL RULE: You must generate all titles, content, descriptions, and verdicts completely in ENGLISH. Do not use Turkish."
    return "⚠️ ÇOK ÖNEMLİ KURAL: Üreteceğin tüm başlıklar, açıklamalar, içerikler ve nihai kararlar KESİNLİKLE tamamen TÜRKÇE dilinde olmalıdır."

# =====================================================================
# 4. API ENDPOINTS (AKILLI SERVİS KATMANLARI)
# =====================================================================

# [1. GÜN ENDPOINT'İ]: Sektör bazlı proje fikirleri üreten servis
@app.get("/api/projects/{sector}")
def get_sector_projects(sector: str, lang: str = "tr"):
    # [15. GÜN BELLEK SİHRİ]: Kullanıcının arattığı sektörü hafızaya kaydet/güncelle
    db = SessionLocal()
    try:
        context = db.query(UserContext).filter(UserContext.session_id == "default_user").first()
        if not context:
            context = UserContext(session_id="default_user", last_searched_sector=sector)
            db.add(context)
        else:
            context.last_searched_sector = sector
        db.commit()
    except Exception as db_error:
        print(f"⚠️ [MEMORY WRITE ERROR]: {str(db_error)}")
    finally:
        db.close()

    # Gemini Prompt Hazırlığı
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen kıdemli bir Yapay Zeka ve Veri Bilimi Mentorüsün. 
    Kullanıcı '{sector}' sektörü için yapay zeka proje fikirleri istiyor.
    Lütfen bu sektöre katma değer sağlayacak, güncel trendlere uygun 2 adet özgün proje fikri üret.
    
    {lang_instruction}
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
        
    except Exception as gemini_error:
        # 🚨 GEMINI ÇÖKERSE VEYA RATE LIMIT (429) VERİRSE DEVREYE GİRECEK KURTARMA PLANI:
        print(f"⚠️ [GEMINI FALLBACK]: '{sector}' sektörü için Gemini limitine takılındı veya hata alındı. Statik veriler dönülüyor.")
        
        # Sektöre göre döneceğimiz acil durum projeleri (SectorProjectResponse yapısına uygun)
        fallback_data = {
            "finance": {
                "projects": [
                    {
                        "title": "Farmance",
                        "description": "Tarım simülasyonu mekanikleriyle kişisel finans yönetimini ve yatırım araçlarını öğreten mobil finansal okuryazarlık oyunu."
                    },
                    {
                        "title": "Mikro-Yatırım Asistanı",
                        "description": "Kullanıcıların günlük harcamalarının küsuratlarını otomatik olarak fona veya altına dönüştüren akıllı birikim uygulaması."
                    }
                ]
            },
            "e-ticaret": {
                "projects": [
                    {
                        "title": "Tashigo",
                        "description": "Esnaf drop-off noktaları ve yerel ticari ortaklıklar kullanan, peer-to-peer kargo lojistiği sağlayan akıllı kurye platformu."
                    },
                    {
                        "title": "Dinamik Fiyatlandırma Paneli",
                        "description": "Yapay zeka modelleriyle talep, stok durumu ve rakip analizlerine göre ürün fiyatlarını otomatik güncelleyen e-ticaret yönetim aracı."
                    }
                ]
            }
        }
        
        # İstek yapılan sektörü küçük harfe çevirip eşleştiriyoruz
        sector_key = sector.lower()
        if sector_key in fallback_data:
            return fallback_data[sector_key]
            
        # Eğer tanımlı olmayan bir sektör ise varsayılan olarak döneceğimiz yedek şablon
        return {
            "projects": [
                {
                    "title": f"Yapay Zeka Destekli {sector} Platformu",
                    "description": f"{sector} alanındaki operasyonları yapay zeka modelleriyle optimize eden, veri analizi ve tahminleme sunan akıllı yazılım çözümü."
                },
                {
                    "title": f"Akıllı {sector} Asistanı",
                    "description": f"Kullanıcıların {sector} süreçlerindeki sorunlarını çözmek amacıyla eğitilmiş, özelleştirilmiş büyük dil modeli asistanı."
                }
            ]
        }
# [2. GÜN ENDPOINT'İ]: Seçilen projeye özel mimari ve yol haritası çıkaran Ajan servisi
@app.get("/api/roadmap/{project_title}")
def get_project_roadmap(project_title: str, lang: str = "tr"):
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Kariyer ve Yazılım Mimarı Ajanı'sın.
    Kullanıcı '{project_title}' isimli yapay zeka/veri bilimi projesini geliştirmek istiyor.
    
    Lütfen bu proje için:
    1. Üretim ortamına uygun (production-ready) 3 temel mimari bileşen öner ve nedenlerini açıkla.
    2. Kullanıcının bu projeyi sıfırdan yapabilmesi için 5 günlük, mantıklı ve adımlı bir öğrenme/geliştirme yol haritası çıkar.
    
    {lang_instruction}
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
def get_tech_radar(lang: str = "tr"):
    lang_instruction = get_language_instruction(lang)
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
                    description=repo["description"] if repo["description"] else "No description.",
                    metric=f"⭐ {repo['stargazers_count']} Stars"
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
                    description=f"Model Type: {model.get('pipeline_tag', 'Unknown')}",
                    metric=f"📥 {model.get('downloads', 0)} Downloads"
                )
            )

        analysis_prompt = f"""
        Aşağıda GitHub ve Hugging Face platformlarından çekilmiş canlı popüler teknoloji verileri yer almaktadır:
        GitHub Verileri: {json.dumps([item.dict() for item in gh_items])}
        Hugging Face Verileri: {json.dumps([item.dict() for item in hf_items])}
        
        Lütfen bu repoların ve modellerin ne işe yaradığını analiz et ve her birinin açıklama (description) kısmını teknik ama anlaşılır şekilde yeniden yazarak şemaya uygun şekilde dön.
        
        {lang_instruction}
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


@app.get("/api/evaluate")
def evaluate_idea(idea: str, lang: str = "tr", db: Session = Depends(get_db)):
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Fikir Eleştirmen ve Girişim Mentorü Ajanı'sın.
    Kullanıcı sana şu girişim veya ürün fikrini sundu: "{idea}"
    
    Lütfen bu fikri pazar payı, ölçeklenebilirlik, rakipler ve teknik fizibilite açısından rasyonel bir şekilde eleştir.
    - market_score ve technical_score değerlerini 10 üzerinden dürüstçe puanla (cömert davranma).
    - Güçlü (strengths) ve zayıf (weaknesses) yönlerini maddeler halinde çıkar.
    - Son olarak 'final_verdict' kısmında bu fikre devam etmeli mi yoksa pivot mu etmeli dürüstçe yaz.
    
    {lang_instruction}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectEvaluationResponse,
                temperature=0.5
            ),
        )
        ai_data = json.loads(response.text)
        
        # [11. GÜN SİHRİ]: Analizi Veri Tabanına Kaydet
        db_record = EvaluationHistory(
            mode="startup",
            user_input=idea,
            ai_response=response.text
        )
        db.add(db_record)
        db.commit()
        
        return ai_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/evaluate-dev")
def evaluate_dev_project(project: str, lang: str = "tr"):
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Kıdemli Yazılım Mimarı ve Bilgisayar Mühendisliği Mentorü'sün.
    Bir bilgisayar mühendisliği öğrencisi/geliştirici, kendini teknik olarak geliştirmek için şu projeyi yapmak istiyor: "{project}"
    
    Lütfen bu projeyi bir ticarileşme fikri olarak DEĞİL, tamamen mühendislik ve kariyer gelişimi açısından analiz et.
    - Teknik zorluk ve CV etkisine dürüst skorlar ver (cömert davranma).
    - Hangi zorlu mühendislik problemleriyle (örn: race condition, veri tutarlılığı, önbellekleme vb.) karşılaşabileceğini belirt.
    
    {lang_instruction}
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
        
        ai_data = json.loads(response.text)
        
        try:
            db = SessionLocal()
            db_record = EvaluationHistory(
                mode="dev",
                user_input=project,
                ai_response=response.text  
            )
            db.add(db_record)
            db.commit()
            db.close()
        except Exception as db_err:
            print(f"⚠️ [SQLITE GEÇMİŞ KAYIT HATASI]: {str(db_err)}")
            
        return ai_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suggest-projects", response_model=ProjectSuggestionsResponse)
def suggest_projects(area: str = None, level: str = "Orta", lang: str = "tr"):
    # [15. GÜN BAĞLAM OKUMA]: Eğer area boş geldiyse hafızadaki son sektöre bak
    db = SessionLocal()
    try:
        context = db.query(UserContext).filter(UserContext.session_id == "default_user").first()
    except Exception as db_err:
        print(f"⚠️ [MEMORY READ ERROR]: {str(db_err)}")
        context = None
    finally:
        db.close()

    # Eğer frontend'den alan seçilmediyse ve hafızada bir pazar alanı varsa onu kullan, yoksa e-commerce'e fallback et
    effective_area = area if area and area.strip() != "" else (context.last_searched_sector if context and context.last_searched_sector else "e-commerce")

    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Yazılım Kariyer ve Proje Mentörü'sün.
    Geliştirici adayı kendini teknik olarak geliştirmek için özellikle "{effective_area}" alanında ve "{level}" seviyesinde proje yapmak istiyor.
    
    Lütfen ona bu alanda yapabileceği, sıradan olmayan, CV'sinde parlayacak 4 farklı özgün proje fikri öner.
    Response formatı kesinlikle 'ProjectSuggestionsResponse' şemasına tam uymalıdır.
    
    {lang_instruction}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectSuggestionsResponse,
                temperature=0.7
            ),
        )
        return json.loads(response.text)
    except Exception as gemini_error:
        # 🚨 GEMINI ÇÖKERSE ŞEMAYA TAM UYUMLU ACİL DURUM PLANI:
        print(f"⚠️ [GEMINI FALLBACK]: '{effective_area}' alanı için Gemini limitine takılındı. Statik öneriler dönülüyor.")
        
        # Şemanın beklediği 'title', 'description', 'short_desc' ve 'difficulty' alanlarını tam olarak besliyoruz!
        fallback_suggestions = {
            "area": effective_area,
            "suggestions": [
                {
                    "title": f"Yapay Zeka Destekli {effective_area.capitalize()} Platformu",
                    "description": f"Kullanıcıların {effective_area} süreçlerini optimize eden, akıllı veri analitiği ve dashboard sunan modern bir web uygulaması.",
                    "short_desc": f"Akıllı {effective_area} analiz paneli ve tahminleme aracı.",
                    "difficulty": level
                },
                {
                    "title": f"Akıllı {effective_area.capitalize()} Otomasyon Sistemi",
                    "description": "Gereksiz iş yükünü ortadan kaldıran, veri akışını otomatik analiz eden ve tahminleme yapan akıllı mikroservis mimarisi.",
                    "short_desc": "Mikroservis mimarili akıllı otomasyon backend sistemi.",
                    "difficulty": level
                },
                {
                    "title": f"P2P {effective_area.capitalize()} Paylaşım Ağı",
                    "description": "Kullanıcıların doğrudan etkileşime girmesini sağlayan, güvenli ve merkeziyetsiz bir pazar yeri tasarımı.",
                    "short_desc": "Güvenli, doğrudan kullanıcılar arası paylaşım ağı.",
                    "difficulty": level
                },
                {
                    "title": f"Mobil {effective_area.capitalize()} Mentor Uygulaması",
                    "description": f"Kullanıcılara {effective_area} alanında kişiselleştirilmiş tavsiyeler ve gerçek zamanlı takip mekanizmaları sunan mobil çözüm.",
                    "short_desc": f"Kişiselleştirilmiş {effective_area} takip ve mobil asistan uygulaması.",
                    "difficulty": level
                }
            ]
        }
        return fallback_suggestions
    
# [16. GÜN]: Medium İçerik Asistanı için Anlık Akış (Streaming) Uç Noktası
@app.get("/api/content-assistant", response_model=MediumResponse)
def get_medium_strategy(topic: str, lang: str = "tr"):
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen profesyonel bir teknik içerik üreticisi ve Medium yazarısın.
    Kullanıcı "{topic}" konusu hakkında bir makale yazmak istiyor.
    Lütfen yanıtını tamamen JSON formatında üret.
    
    {lang_instruction}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MediumResponse,
                temperature=0.7
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================================================================
# [7. GÜN]: CANLI RADAR WEBSOCKET ENDPOINT'İ - ÇOKLU DİL DESTEKLİ
# =====================================================================
@app.websocket("/ws/radar")
async def websocket_radar_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Frontend'den mesaj bekliyoruz: "START_SCAN:tr" veya "START_SCAN:en" şeklinde göndereceğiz
            raw_msg = await websocket.receive_text()
            
            if raw_msg.startswith("START_SCAN"):
                # Gelen dille filtreleme yapıyoruz
                lang = "tr"
                if ":" in raw_msg:
                    lang = raw_msg.split(":")[1]
                
                # Dile göre dinamik fallback ve metin şablonları
                if lang == "en":
                    GITHUB_DESC = "AI-powered community repository."
                    TC_DESC = "Instant AI funding, launch, and ecosystem developments from the global market."
                    HN_DESC = "Deep technical AI topics most discussed by developer communities."
                    m_min, m_hours, m_points, m_stars = "m ago", "h ago", "Points", "Stars"
                    
                    tc_titles = [
                        "OpenAI raises $6.5B in funding for new o1 model series",
                        "Anthropic announces Claude Enterprise for corporations",
                        "Ecosystem shaking: AI video agent startup receives robotics funding"
                    ]
                    hn_titles = [
                        "Beyond Transformers in AI Architectures: State Space Models",
                        "Why Local LLMs are dethroning Cloud Servers",
                        "New Python-based Multi-Agent Framework divides the community"
                    ]
                else:
                    GITHUB_DESC = "Yapay zeka destekli topluluk reposu."
                    TC_DESC = "Küresel pazardan anlık yapay zeka finansman, lansman ve ekosistem gelişmesi."
                    HN_DESC = "Geliştirici topluluklarının en çok konuştuğu derin teknik AI başlıkları."
                    m_min, m_hours, m_points, m_stars = "dk önce", "saat önce", "Puan", "Yıldız"
                    
                    tc_titles = [
                        "OpenAI, yeni o1 akıllı model serisi için 6.5 milyar dolar yatırım topladı",
                        "Anthropic, kurumsal şirketler için Claude Enterprise sürümünü duyurdu",
                        "Girişim dünyası çalkalanıyor: Yerli AI video ajanı robotik yatırımı aldı"
                    ]
                    hn_titles = [
                        "Yapay Zeka Mimarilerinde Transformatörlerin Ötesi: State Space Modelleri",
                        "Neden Yerel LLM'ler (Local LLM) Bulut Sunucularını Tahtından Ediyor?",
                        "Python Tabanlı Yeni Multi-Agent Framework Topluluğu İkiye Böldü"
                    ]

                try:
                    # KANAL 1: GitHub Trend Repoları
                    github_url = "https://api.github.com/search/repositories?q=topic:artificial-intelligence+sort:stars&per_page=3"
                    headers = {"User-Agent": "PathAI-App", "Accept": "application/vnd.github.v3+json"}
                    repos = []
                    try:
                        gh_response = requests.get(github_url, headers=headers, timeout=5)
                        if gh_response.status_code == 200:
                            repos = gh_response.json().get("items", [])
                    except Exception:
                        pass
                        
                    if not repos:
                        repos = [
                            {"name": "microsoft/autogen", "html_url": "https://github.com/microsoft/autogen", "description": "Multi-agent conversation framework.", "stargazers_count": 28500},
                            {"name": "google/gemma", "html_url": "https://github.com/google/gemma", "description": "Open models from Google DeepMind.", "stargazers_count": 14200}
                        ]

                    for repo in repos:
                        await asyncio.sleep(0.6)
                        await websocket.send_text(json.dumps({
                            "source": "github",
                            "name": repo.get("full_name") or repo.get("name"),
                            "url": repo.get("html_url") or repo.get("url"),
                            "description": repo.get("description") or GITHUB_DESC,
                            "metric": f"⭐ {repo.get('stargazers_count', 0)} {m_stars}"
                        }))

                    # KANAL 2: TechCrunch ve Hacker News Fallback Gönderimi
                    for idx, title in enumerate(tc_titles):
                        await asyncio.sleep(0.6)
                        await websocket.send_text(json.dumps({
                            "source": "techcrunch",
                            "name": title,
                            "url": "https://techcrunch.com",
                            "description": TC_DESC,
                            "metric": f"⏰ {idx+1} {m_hours if idx > 0 else m_min}"
                        }))

                    for idx, title in enumerate(hn_titles):
                        await asyncio.sleep(0.6)
                        await websocket.send_text(json.dumps({
                            "source": "hackernews",
                            "name": title,
                            "url": "https://news.ycombinator.com",
                            "description": HN_DESC,
                            "metric": f"🔥 {400 - idx*40} {m_points}"
                        }))

                    await websocket.send_text(json.dumps({"status": "COMPLETED"}))

                except Exception as api_err:
                    await websocket.send_text(json.dumps({"status": "ERROR", "message": str(api_err)}))

    except WebSocketDisconnect:
        print("🔌 Canlı radar WebSocket bağlantısı kapandı.")


class RadarSummaryRequest(BaseModel):
    raw_data: List[dict]

# [10. GÜN ENDPOINT'İ]: Radardan akan ham verileri akıllıca yorumlayan RAG/Özet katmanı
@app.post("/api/radar-summary", response_model=RadarSummaryResponse)
def generate_radar_summary(payload: RadarSummaryRequest, lang: str = "tr"):
    lang_instruction = get_language_instruction(lang)
    if not payload.raw_data:
        raise HTTPException(status_code=400, detail="Özetlenecek ham veri bulunamadı.")
        
    formatted_context = ""
    for idx, item in enumerate(payload.raw_data, 1):
        formatted_context += f"[{idx}] Kaynak: {item.get('source')} | Başlık/Ad: {item.get('name')} | Açıklama: {item.get('description')}\n"

    prompt = f"""
    Sen PathAI platformunun Baş Yapay Zeka Stratejisti ve Baş Mimarı'sın.
    Aşağıda, canlı ağlardan (GitHub, Hugging Face, TechCrunch, Hacker News) anlık olarak çekilmiş en güncel teknoloji ve pazar verileri yer almaktadır:
    
    {formatted_context}
    
    Lütfen bu verileri bütünsel olarak analiz et ve şu çıktıları üret:
    1. 'tldr_summary': Bugün yapay zeka dünyasında tam olarak ne oluyor? Trendler nereye evriliyor? Teknik ama akıcı bir dille özetle.
    2. 'market_opportunities': Bu verilere bakarak bir yazılımcının veya girişimcinin üretebileceği 3 stratejik ürün veya fikir fırsatı çıkar.
    3. 'architectural_trends': Geliştiricilerin projelerinde kullanmaya başladığı mimari yaklaşımları (örn: multi-agent, local LLM serving, semantic graph vb.) listele.
    
    {lang_instruction}
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RadarSummaryResponse,
                temperature=0.4
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# [11. GÜN ENDPOINT'İ]: Kullanıcının geçmiş simülasyon kayıtlarını getiren servis
@app.get("/api/evaluation-history")
def get_evaluation_history(db: Session = Depends(get_db)):
    records = db.query(EvaluationHistory).order_by(EvaluationHistory.created_at.desc()).all()
    
    formatted_records = []
    for r in records:
        formatted_records.append({
            "id": r.id,
            "mode": r.mode,
            "user_input": r.user_input,
            "ai_response": json.loads(r.ai_response),
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return formatted_records


# Geliştirme yaparken Gemini API limitlerine takılmamak için bu modu True yapabilirsin.
# Gerçek Gemini API ile çalışmak istediğinde False yapman yeterlidir.
MOCK_MODE = True  

@app.get("/api/multi-agent/simulate", response_model=MultiAgentOrchestratorResponse)
def run_multi_agent_simulation(project_title: str, sector: str, lang: str = "tr"):
    # 🚨 MOCK MODU AKTİFSE GEMINI'A GİTME, ANINDA YENİ TARTIŞMA VERİSİ DÖN
    if MOCK_MODE:
        print("🛠️ [MOCK MODE ACTIVE]: Gemini API bypass edildi. Tartışmalı test verisi üretiliyor...")
        return {
            "project_title": project_title,
            "cto_report": {
                "software_architecture": "FastAPI tabanlı mikroservis mimarisi ve Next.js frontend entegrasyonu.",
                "database_design": "PostgreSQL birincil veritabanı, oturum ve cache yönetimi için Redis katmanı.",
                "security_infrastructure": "OAuth2 şifreleme protokolü, JWT tabanlı oturum yönetimi ve SSL sertifikası."
            },
            "ceo_report": {
                "target_audience": "Girişimini büyütmek isteyen erken aşama yazılımcılar ve üniversite öğrencileri.",
                "revenue_models": ["Aylık SaaS aboneliği", "PDF Raporu başına ödeme (Pay-as-you-go)", "B2B kurumsal entegrasyon"],
                "go_to_market_strategy": "Üniversite kulüpleriyle ortaklıklar kurmak ve LinkedIn üzerinde organik içerik pazarlaması yapmak."
            },
            "synergy_summary": "Teknik mimari (CTO) ve iş modeli (CEO) genel olarak uyumlu görünüyor.",
            "user_test": {
                "persona_name": "Caner Yılmaz",
                "demographics": "22 yaşında, bilgisayar mühendisliği öğrencisi, kısıtlı bütçeye sahip.",
                "pain_points": ["Projelerine nasıl başlayacağını bilemiyor", "Teknik rapor hazırlamak çok vaktini alıyor"],
                "brutal_feedback": "Arayüz harika ama bir öğrenci olarak aylık abonelik ücreti benim için çok pahalı.",
                "adoption_score": 85
            },
            "debate_report": {
                "cto_criticism": "CEO'nun önerdiği 'SaaS abonelik modeli' için erken aşamada çok karmaşık bir ödeme altyapısı kurmamız gerekir. İlk etapta tekil ödemelerle başlamak teknik borcu (technical debt) azaltacaktır.",
                "ceo_criticism": "CTO'nun önerdiği 'Mikroservis mimarisi' ve 'Redis katmanı' MVP aşaması için çok lüks. Bu mimariyi kurmak pazara çıkışımızı en az 2 ay geciktirir. Basit bir monolit yapıyla başlamalıyız.",
                "mvp_consensus": "Ortak karar: Projeye PostgreSQL kullanan monolit bir FastAPI yapısıyla başlanacak. Ödeme sistemi olarak karmaşık abonelikler yerine, kullanıcıların sadece kullandıkları kadar ödeyecekleri basit bir entegrasyon (pay-as-you-go) kurulacak. Böylece hem 3 haftada yayına çıkabileceğiz hem de maliyetleri minimumda tutacağız."
            }
        }

    # 🌐 GERÇEK GEMINI AKIŞI
    db = SessionLocal()
    normalized_input = normalize_text(project_title)
    
    try:
        # Önbellek Kontrolü (Hızlı geçiş için doğrudan sorguyu çalıştırıyoruz)
        lang_instruction = get_language_instruction(lang)
        
        # --- 1. CTO Raporu ---
        cto_prompt = f"Rol: Kıdemli CTO. Proje: '{project_title}' ({sector}). Teknik mimariyi tasarla."
        cto_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=cto_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=CTOAnalysis, temperature=0.3),
        )
        cto_data = json.loads(cto_response.text)
        time.sleep(4.0)

        # --- 2. CEO Raporu ---
        ceo_prompt = f"Rol: Vizyoner CEO. Proje: '{project_title}' ({sector}). İş planı ve gelir modellerini tasarla."
        ceo_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=ceo_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=CEOAnalysis, temperature=0.5),
        )
        ceo_data = json.loads(ceo_response.text)
        time.sleep(4.0)

        # --- 3. TARTIŞMA & UZLAŞI AJANI (Yeni Adım) ---
        debate_prompt = f"""
        Aşağıda aynı proje için hazırlanan teknik rapor (CTO) ve iş planı (CEO) yer almaktadır:
        CTO Tasarımı: {cto_response.text}
        CEO Tasarımı: {ceo_response.text}
        
        Görevlerin:
        1. CTO gözüyle: CEO'nun iş modelini teknik zorluk ve bütçe açısından eleştir.
        2. CEO gözüyle: CTO'nun mimarisini süre ve pazar hızı (Time-to-market) açısından eleştir.
        3. Ortak Uzlaşı (MVP Consensus): İki tarafın da kabul edeceği, en hızlı ve kararlı yayına çıkış (MVP) planını yaz.
        
        {lang_instruction}
        """
        debate_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=debate_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AgentDebateAnalysis,
                temperature=0.6
            ),
        )
        debate_data = json.loads(debate_response.text)
        time.sleep(4.0)

        # --- 4. Sinerji Özet ---
        synergy_prompt = f"CTO: {cto_response.text}, CEO: {ceo_response.text}. Girişimciye en kritik 3 tavsiyeyi yaz. {lang_instruction}"
        synergy_response = client.models.generate_content(
            model='gemini-2.5-flash', contents=synergy_prompt, config=types.GenerateContentConfig(temperature=0.5)
        )
        time.sleep(4.0)

        # --- 5. User Persona ---
        user_prompt = f"Proje: '{project_title}'. Hedef Kitle: '{ceo_data.get('target_audience', '')}'. Bu ürünü kullanır mıydın? Puanla. {lang_instruction}"
        user_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=UserPersonaAnalysis, temperature=0.6),
        )
        user_data = json.loads(user_response.text)

        return {
            "project_title": project_title,
            "cto_report": cto_data,
            "ceo_report": ceo_data,
            "synergy_summary": synergy_response.text,
            "user_test": user_data,
            "debate_report": debate_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))