import os
import json
import time
import re
from fastapi import HTTPException
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

# Modüler şemalarımızı ve DB modellerimizi import ediyoruz
from app.core.database import MultiAgentHistory, EvaluationHistory, UserContext
from app.schemas.agent_schemas import (
    SectorProjectResponse,
    ProjectProjectRoadmapResponse,
    TechRadarResponse,
    ProjectEvaluationResponse,
    DevEvaluationResponse,
    ProjectSuggestionsResponse,
    MediumResponse,
    RadarSummaryResponse,
    CTOAnalysis,
    CEOAnalysis,
    AgentDebateAnalysis,
    CompetitorAnalysis,
    FinancialAnalysis,
    GrowthAnalysis,
    LegalAndRiskAnalysis,
    QAAnalysis,
    PerformanceAnalysis,
    UserPersonaAnalysis
)

# Gemini API İstemcisi Kurulumu
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# =====================================================================
# --- SEMANTİK ÖNBELLEK VE METİN NORMALİZASYON YARDIMCILARI ---
# =====================================================================

def normalize_text(text: str) -> str:
    """Metni küçük harfe çevirir, Türkçe karakterleri standardize eder ve temizler."""
    if not text:
        return ""
    text = text.lower().strip()
    replacements = {
        'ı': 'i', 'ş': 's', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ç': 'c'
    }
    for search, replace in replacements.items():
        text = text.replace(search, replace)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return " ".join(text.split())

def get_semantic_match(new_title: str, db: Session) -> MultiAgentHistory:
    """Jaccard benzerliği kullanarak veritabanında semantik önbellek araması yapar."""
    new_norm = normalize_text(new_title)
    new_words = set(new_norm.split())
    
    if len(new_words) < 2:
        return db.query(MultiAgentHistory).filter(MultiAgentHistory.normalized_title == new_norm).first()
        
    all_cached = db.query(MultiAgentHistory).all()
    best_match = None
    highest_similarity = 0.0
    
    for record in all_cached:
        if record.normalized_title == new_norm:
            return record
            
        record_words = set(record.normalized_title.split())
        if not record_words:
            continue
            
        intersection = new_words.intersection(record_words)
        union = new_words.union(record_words)
        similarity = len(intersection) / len(union)
        
        # %75 ve üzeri kelime benzerliği eşleşme kabul edilir
        if similarity > 0.75 and similarity > highest_similarity:
            highest_similarity = similarity
            best_match = record
            
    if best_match:
        print(f"🎯 [SEMANTIC CACHE HIT]: '{new_title}' önbellekten '{best_match.original_title}' ile eşleşti! (%{int(highest_similarity*100)})")
    return best_match

def get_language_instruction(lang: str) -> str:
    """Ajanlara dil yönergesi sağlar."""
    if lang == "en":
        return "⚠️ CRITICAL RULE: You must generate all content, descriptions, and reports completely in ENGLISH."
    return "⚠️ ÇOK ÖNEMLİ KURAL: Üreteceğin tüm içerikler, başlıklar ve analizler tamamen TÜRKÇE dilinde olmalıdır."

# =====================================================================
# --- SERVIS ÇAĞRILARI ---
# =====================================================================

def run_project_generation(sector: str, lang: str) -> dict:
    """1. Gün: Sektöre özel proje fikirleri üretir."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen kıdemli bir Yapay Zeka ve Veri Bilimi Mentorüsün. 
    Kullanıcı '{sector}' sektörü için yapay zeka proje fikirleri istiyor.
    Lütfen bu sektöre katma değer sağlayacak, güncel trendlere uygun 2 adet özgün proje fikri üret.
    
    {lang_instruction}
    """
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

def run_roadmap_generation(project_title: str, lang: str) -> dict:
    """2. Gün: Seçilen projeye özel mimari ve 5 günlük yol haritası çıkarır."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Kariyer ve Yazılım Mimarı Ajanı'sın.
    Kullanıcı '{project_title}' isimli yapay zeka/veri bilimi projesini geliştirmek istiyor.
    
    Lütfen bu proje için:
    1. Üretim ortamına uygun (production-ready) 3 temel mimari bileşen öner ve nedenlerini açıkla.
    2. Kullanıcının bu projeyi sıfırdan yapabilmesi için 5 günlük, mantıklı ve adımlı bir öğrenme/geliştirme yol haritası çıkar.
    
    {lang_instruction}
    """
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

def run_radar_analysis(gh_items: list, hf_items: list, lang: str) -> dict:
    """3. Gün: GitHub ve Hugging Face trend verilerini yapay zekayla zenginleştirir."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Aşağıda GitHub ve Hugging Face platformlarından çekilmiş canlı popüler teknoloji verileri yer almaktadır:
    GitHub Verileri: {json.dumps(gh_items)}
    Hugging Face Verileri: {json.dumps(hf_items)}
    
    Lütfen bu repoların ve modellerin ne işe yaradığını analiz et ve her birinin açıklama (description) kısmını teknik ama anlaşılır şekilde yeniden yazarak şemaya uygun şekilde dön.
    
    {lang_instruction}
    """
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TechRadarResponse,
            temperature=0.3
        ),
    )
    return json.loads(response.text)

def run_idea_evaluation(idea: str, lang: str) -> dict:
    """4. Gün: Fikir Eleştirmen ve Girişim Mentorü Ajanı analizi."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
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
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ProjectEvaluationResponse,
            temperature=0.5
        ),
    )
    return json.loads(response.text)

def run_dev_evaluation(project: str, lang: str) -> dict:
    """8. Gün: Kıdemli Yazılım Mimarı ve Bilgisayar Mühendisliği Mentorü analizi."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Kıdemli Yazılım Mimarı ve Bilgisayar Mühendisliği Mentorü'sün.
    Bir bilgisayar mühendisliği öğrencisi/geliştirici, kendini teknik olarak geliştirmek için şu projeyi yapmak istiyor: "{project}"
    
    Lütfen bu projeyi bir ticarileşme fikri olarak DEĞİL, tamamen mühendislik ve kariyer gelişimi açısından analiz et.
    - Teknik zorluk ve CV etkisine dürüst skorlar ver (cömert davranma).
    - Hangi zorlu mühendislik problemleriyle (örn: race condition, veri tutarlılığı, önbellekleme vb.) karşılaşabileceğini belirt.
    
    {lang_instruction}
    """
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

def run_suggest_projects(area: str, level: str, lang: str) -> dict:
    """8. Gün: Seviyeye ve alana göre özgün geliştirici proje önerileri üretir."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun 'Yazılım Kariyer ve Proje Mentörü'sün.
    Geliştirici adayı kendini teknik olarak geliştirmek için özellikle "{area}" alanında ve "{level}" seviyesinde proje yapmak istiyor.
    
    Lütfen ona bu alanda yapabileceği, sıradan olmayan, CV'sinde parlayacak 4 farklı özgün proje fikri öner.
    Response formatı kesinlikle 'ProjectSuggestionsResponse' şemasına tam uymalıdır.
    
    {lang_instruction}
    """
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

def run_medium_strategy(topic: str, lang: str) -> dict:
    """16. Gün: Medium makale asistanı içerik üretimi."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen profesyonel bir teknik içerik üreticisi ve Medium yazarısın.
    Kullanıcı "{topic}" konusu hakkında bir makale yazmak istiyor.
    Lütfen yanıtını tamamen JSON formatında üret.
    
    {lang_instruction}
    """
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

def run_radar_summary(formatted_context: str, lang: str) -> dict:
    """10. Gün: Radardan akan ham verileri analiz eden akıllı RAG özetleme katmanı."""
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Anahtarı bulunamadı.")
        
    lang_instruction = get_language_instruction(lang)
    prompt = f"""
    Sen PathAI platformunun Baş Yapay Zeka Stratejisti ve Baş Mimarı'sın.
    Aşağıda, canlı ağlardan anlık olarak çekilmiş en güncel teknoloji ve pazar verileri yer almaktadır:
    
    {formatted_context}
    
    Lütfen bu verileri bütünsel olarak analiz et ve şu çıktıları üret:
    1. 'tldr_summary': Bugün yapay zeka dünyasında tam olarak ne oluyor? Trendler nereye evriliyor? Teknik ama akıcı bir dille özetle.
    2. 'market_opportunities': Bu verilere bakarak bir yazılımcının veya girişimcinin üretebileceği 3 stratejik ürün veya fikir fırsatı çıkar.
    3. 'architectural_trends': Geliştiricilerin projelerinde kullanmaya başladığı mimari yaklaşımları listele.
    
    {lang_instruction}
    """
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

# --- ÇOKLU AJAN SİMÜLASYONU YENİ ORKESTRASYON SERVİSİ ---
# Bir önceki adımda app/services/gemini_service.py içerisine eklediğimiz run_orchestration metodu, 
# app/schemas/agent_schemas.py'da birleştirdiğimiz yeni şema importları ile pürüzsüz çalışmaya devam edecektir.

def get_mock_response(project_title: str, sector: str) -> dict:
    """Mock modunda anında dönülecek zenginleştirilmiş test verisi."""
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
            "cto_criticism": "CEO'nun SaaS modeli için karmaşık ödeme altyapısı kurmamız gerekir.",
            "ceo_criticism": "CTO'nun mikroservis tasarımı MVP aşaması için lüks.",
            "mvp_consensus": "Ortak karar: PostgreSQL kullanan monolit bir FastAPI yapısıyla başlanacak."
        },
        "competitor_report": {
            "competitors": [
                {
                    "name": "SaaS Starter Kits",
                    "weakness": "Sadece şablon veriyorlar, sektörel akıllı analiz sunmuyorlar.",
                    "our_advantage": "Projenin bütçesine ve teknik hedeflerine özel dinamik yol haritaları çıkarıyoruz."
                }
            ],
            "positioning_strategy": "Rakiplerimiz sadece şablon sunarken, biz orkestrasyon paneli üzerinden entegre analizler veren lider platformuz."
        },
        "financial_report": {
            "initial_mvp_cost": 500.0,
            "monthly_burn_rate": 80.0,
            "break_even_months": 6,
            "costs_breakdown": [
                {"name": "Yapay Zeka API Kullanımı", "amount": 40.0, "is_recurring": True},
                {"name": "Sunucu Barındırma", "amount": 20.0, "is_recurring": True}
            ]
        },
        "growth_report": {
            "growth_strategy_title": "Product-Led Loop (Ürün Odaklı Büyüme Çarkı)",
            "funnel_tactics": {
                "acquisition_channel": "Build-in-Public: Süreci X ve LinkedIn üzerinden teknik makalelerle paylaşmak.",
                "activation_tactic": "Interactive First Simulation: Kullanıcının üye olmadan proje başlığı girerek hızlıca rapor alması.",
                "viral_loop": "Shareable Report & Reward: Üretilen raporları paylaşılabilir şık linkler haline getirmek."
            },
            "recommended_tools": ["Mixpanel", "Loops.so", "Segment"]
        },
        "legal_report": {
            "legal_strategy_title": "Compliance Shield (Yasal ve Teknik Güvence Kalkanı)",
            "legal_requirements": [
                {
                    "title": "KVKK / GDPR Açık Rıza ve Çerez Aydınlatma Metni",
                    "description": "Kullanıcı verilerini saklamadan önce onay kutucukları sunulmalı ve aydınlatma metinleri eklenmelidir.",
                    "risk_level": "Kritik"
                }
            ],
            "technical_risks": [
                {
                    "risk_name": "API Bağımlılığı ve Hizmet Kesintisi",
                    "mitigation_plan": "Fallback ve statik önbellek (Semantic Cache) mekanizmaları devrede tutulmalıdır."
                }
            ]
        },
        "qa_report": {
            "test_suite_title": "Automated API & Agent Schema Integration Test Suite",
            "overall_health_score": 98,
            "test_cases": [
                {
                    "endpoint": "GET /api/multi-agent/simulate?project_title=... (Şema Doğrulaması)",
                    "status": "PASSED",
                    "response_time_ms": 120,
                    "validation_notes": "Pydantic şeması tüm ajan çıktıları için %100 başarıyla doğrulandı."
                }
            ],
            "critical_vulnerabilities": [
                "Hatalı karakter içeren proje başlıkları için endpoint bazında sanitization filtresi güçlendirilmelidir."
            ]
        },
        "performance_report": {
            "monitor_title": "PathAI Real-Time Performance & Token Savings Dashboard",
            "metrics": {
                "total_tokens_saved": 42500,
                "cost_saved_usd": 0.85,
                "api_latency_reduction_percent": 96,
                "cache_status": "HIT"
            },
            "bottlenecks": [
                "Ardışık bekleme (sleep) mekanizması yerine asenkron paralelleştirme kurgusuna geçilebilir."
            ]
        }
    }

def run_orchestration(project_title: str, sector: str, lang: str, mock_mode: bool) -> dict:
    """
    Tüm çoklu ajan simülasyonunu ve veri akışını yöneten ana orkestrasyon servisi.
    """
    # 🚨 MOCK MODU AKTİFSE ANINDA TEST VERİSİ DÖN
    if mock_mode:
        print("🛠️ [MOCK MODE ACTIVE - SERVICE]: Gemini API bypass edildi. Simüle edilmiş veri üretiliyor...")
        return get_mock_response(project_title, sector)

    if not client:
        raise HTTPException(
            status_code=500, 
            detail="Gemini API Key bulunamadı! Lütfen .env dosyasını kontrol edin."
        )

    lang_instruction = get_language_instruction(lang)

    try:
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

        # --- 3. TARTIŞMA & UZLAŞI AJANI ---
        debate_prompt = f"CTO: {cto_response.text}\nCEO: {ceo_response.text}\nBu raporları teknik ve ticari açıdan karşılıklı eleştir ve nihai MVP uzlaşısını yaz."
        debate_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=debate_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=AgentDebateAnalysis, temperature=0.6),
        )
        debate_data = json.loads(debate_response.text)
        time.sleep(4.0)

        # --- 4. RAKİP ANALİZİ AJANI ---
        competitor_prompt = f"Proje: '{project_title}'. Sektör: '{sector}'. Rakipleri analiz et ve konumlandırma stratejisini çıkar."
        competitor_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=competitor_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=CompetitorAnalysis, temperature=0.7),
        )
        competitor_data = json.loads(competitor_response.text)
        time.sleep(4.0)

        # --- 5. FİNANSAL ANALİZ AJANI ---
        financial_prompt = f"Proje: '{project_title}'. Mimari: {cto_response.text}. İş Planı: {ceo_response.text}. Gerçekçi bir bütçeleme ve maliyet tablosu çıkar."
        financial_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=financial_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=FinancialAnalysis, temperature=0.5),
        )
        financial_data = json.loads(financial_response.text)
        time.sleep(4.0)

        # --- 6. BÜYÜME VE PAZARLAMA AJANI ---
        growth_prompt = f"Proje: '{project_title}'. Hedef Kitle: {ceo_data.get('target_audience', '')}. Büyüme ve viral döngü stratejilerini kur."
        growth_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=growth_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=GrowthAnalysis, temperature=0.6),
        )
        growth_data = json.loads(growth_response.text)
        time.sleep(4.0)

        # --- 7. HUKUKİ UYUMLULUK VE RİSK AJANI ---
        legal_prompt = f"Proje: '{project_title}'. Mimari: {cto_response.text}. İş Planı: {ceo_response.text}. Yasal ve teknik risk analizini çıkar."
        legal_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=legal_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=LegalAndRiskAnalysis, temperature=0.5),
        )
        legal_data = json.loads(legal_response.text)
        time.sleep(4.0)

        # --- 8. TEST OTOMASYONU VE QA AJANI ---
        qa_prompt = f"Proje: '{project_title}'. Mimari: {cto_response.text}. Risk Analizi: {legal_response.text}. QA Raporu ve entegrasyon test sonuçlarını çıkar."
        qa_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=qa_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=QAAnalysis, temperature=0.4),
        )
        qa_data = json.loads(qa_response.text)
        time.sleep(4.0)

        # --- 9. PERFORMANS VE ÖNBELLEK AJANI ---
        performance_prompt = f"Proje: '{project_title}'. Mimari: {cto_response.text}. QA Raporu: {qa_response.text}. Sistem önbellek ve performans analizini çıkar."
        performance_response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=performance_prompt + f"\n{lang_instruction}",
            config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=PerformanceAnalysis, temperature=0.3),
        )
        performance_data = json.loads(performance_response.text)
        time.sleep(4.0)

        # --- 10. Sinerji Özet ---
        synergy_prompt = f"CTO: {cto_response.text}, CEO: {ceo_response.text}. Girişimciye en kritik 3 tavsiyeyi yaz. {lang_instruction}"
        synergy_response = client.models.generate_content(
            model='gemini-2.5-flash', contents=synergy_prompt, config=types.GenerateContentConfig(temperature=0.5)
        )
        time.sleep(4.0)

        # --- 11. User Persona ---
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
            "debate_report": debate_data,
            "competitor_report": competitor_data,
            "financial_report": financial_data,
            "growth_report": growth_data,
            "legal_report": legal_data,
            "qa_report": qa_data,
            "performance_report": performance_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    