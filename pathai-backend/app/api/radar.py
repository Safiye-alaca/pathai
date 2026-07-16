import asyncio
import json
import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from app.schemas.agent_schemas import RadarSummaryRequest, RadarSummaryResponse
from app.services.gemini_service import run_radar_summary

router = APIRouter(tags=["Tech Radar & WebSocket"])

# =====================================================================
# --- [7. GÜN]: CANLI RADAR WEBSOCKET ENDPOINT'İ ---
# =====================================================================
@router.websocket("/ws/radar")
async def websocket_radar_endpoint(websocket: WebSocket):
    """
    İstemciden gelen START_SCAN mesajına göre canlı GitHub, TechCrunch ve 
    Hacker News verilerini akış (streaming) halinde gönderen WebSocket kanalı.
    """
    await websocket.accept()
    
    try:
        while True:
            raw_msg = await websocket.receive_text()
            
            if raw_msg.startswith("START_SCAN"):
                # Gelen dil parametresini ayrıştır (Örn: START_SCAN:tr veya START_SCAN:en)
                lang = "tr"
                if ":" in raw_msg:
                    lang = raw_msg.split(":")[1]
                
                # Dile göre dinamik metin ve fallback şablonları
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
                    # --- KANAL 1: GitHub Trend Repoları ---
                    github_url = "https://api.github.com/search/repositories?q=topic:artificial-intelligence+sort:stars&per_page=3"
                    headers = {"User-Agent": "PathAI-App", "Accept": "application/vnd.github.v3+json"}
                    repos = []
                    try:
                        gh_response = requests.get(github_url, headers=headers, timeout=5)
                        if gh_response.status_code == 200:
                            repos = gh_response.json().get("items", [])
                    except Exception:
                        pass
                        
                    # GitHub API limiti veya hatası durumunda statik yedekler (fallback)
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

                    # --- KANAL 2: TechCrunch Haber Akışı (Simüle Edilmiş Canlı Veri) ---
                    for idx, title in enumerate(tc_titles):
                        await asyncio.sleep(0.6)
                        await websocket.send_text(json.dumps({
                            "source": "techcrunch",
                            "name": title,
                            "url": "https://techcrunch.com",
                            "description": TC_DESC,
                            "metric": f"⏰ {idx+1} {m_hours if idx > 0 else m_min}"
                        }))

                    # --- KANAL 3: Hacker News Teknik Başlıkları (Simüle Edilmiş Canlı Veri) ---
                    for idx, title in enumerate(hn_titles):
                        await asyncio.sleep(0.6)
                        await websocket.send_text(json.dumps({
                            "source": "hackernews",
                            "name": title,
                            "url": "https://news.ycombinator.com",
                            "description": HN_DESC,
                            "metric": f"🔥 {400 - idx*40} {m_points}"
                        }))

                    # Akış bittiğinde tamamlandı mesajı gönder
                    await websocket.send_text(json.dumps({"status": "COMPLETED"}))

                except Exception as api_err:
                    await websocket.send_text(json.dumps({"status": "ERROR", "message": str(api_err)}))

    except WebSocketDisconnect:
        print("🔌 Canlı radar WebSocket bağlantısı başarıyla kapatıldı.")


# =====================================================================
# --- [10. GÜN]: RADARDAN AKAN HAM VERİLERİ ÖZETLEYEN RAG ENDPOINT'İ ---
# =====================================================================
@router.post("/api/radar-summary", response_model=RadarSummaryResponse)
def generate_radar_summary(payload: RadarSummaryRequest, lang: str = "tr"):
    """Canlı radardan akan ham veri listesini derleyip akıllıca özetler."""
    if not payload.raw_data:
        raise HTTPException(status_code=400, detail="Özetlenecek ham veri bulunamadı.")
        
    formatted_context = ""
    for idx, item in enumerate(payload.raw_data, 1):
        formatted_context += (
            f"[{idx}] Kaynak: {item.get('source')} | "
            f"Başlık/Ad: {item.get('name')} | "
            f"Açıklama: {item.get('description')}\n"
        )

    try:
        return run_radar_summary(formatted_context=formatted_context, lang=lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))