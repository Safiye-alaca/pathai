from pydantic import BaseModel, Field
from typing import List, Optional

# =====================================================================
# --- 1. GÜN: SEKTÖREL PROJE ÖNERİSİ ŞEMALARI ---
# =====================================================================
class ProjectSuggestion(BaseModel):
    title: str = Field(description="Önerilen projenin başlığı")
    description: str = Field(description="Projenin detaylı açıklaması ve işlevi")
    difficulty: str = Field(description="Projenin zorluk derecesi (Kolay, Orta, Zor)")
    why_this: str = Field(description="Bu projenin bu sektöre neden uygun olduğu ve getireceği katma değer")

class SectorProjectResponse(BaseModel):
    sector: str = Field(description="Sorgulanan sektör adı")
    projects: List[ProjectSuggestion] = Field(description="Sektöre özel üretilen 2 adet özgün proje fikri")


# =====================================================================
# --- 2. GÜN: YOL HARİTASI VE MİMARİ ŞEMALARI ---
# =====================================================================
class ArchitectureComponent(BaseModel):
    layer: str = Field(description="Mimari katmanın adı (Frontend, Backend, Database, AI, vb.)")
    technology: str = Field(description="Önerilen teknoloji veya kütüphane")
    reason: str = Field(description="Bu teknolojinin seçilme nedeni ve avantajı")

class RoadmapDay(BaseModel):
    day_number: int = Field(description="Geliştirme gün numarası (1-5 arası)")
    topic: str = Field(description="O gün odaklanılacak ana konu/tema")
    tasks: List[str] = Field(description="O gün tamamlanması gereken mikro görevler")

class ProjectProjectRoadmapResponse(BaseModel):
    project_title: str = Field(description="Yol haritası çıkarılan projenin adı")
    architecture_stack: List[ArchitectureComponent] = Field(description="Önerilen 3 temel mimari bileşen")
    learning_roadmap: List[RoadmapDay] = Field(description="5 günlük adımlı öğrenme ve geliştirme yol haritası")


# =====================================================================
# --- 3. GÜN: GITHUB & HUGGING FACE RADARI ŞEMALARI ---
# =====================================================================
class TechRadarItem(BaseModel):
    name: str = Field(description="Reponun veya modelin tam adı")
    url: str = Field(description="GitHub/Hugging Face erişim linki")
    description: str = Field(description="Teknik ama anlaşılır açıklama metni")
    metric: str = Field(description="Yıldız (Stars) veya İndirme (Downloads) sayısı")

class TechRadarResponse(BaseModel):
    github_trending: List[TechRadarItem] = Field(description="Trend olan en popüler 3 GitHub reposu")
    huggingface_trending: List[TechRadarItem] = Field(description="Trend olan en popüler 3 Hugging Face modeli")


# =====================================================================
# --- 4. GÜN: FİKİR ELEŞTİRMEN AJANI ŞEMALARI ---
# =====================================================================
class ProjectEvaluationResponse(BaseModel):
    user_idea: str = Field(description="Kullanıcının değerlendirilen fikir metni")
    market_score: int = Field(description="10 üzerinden pazar ve ticari potansiyel skoru")
    technical_score: int = Field(description="10 üzerinden teknik uygulanabilirlik skoru")
    strengths: List[str] = Field(description="Fikrin en güçlü 3 yönü")
    weaknesses: List[str] = Field(description="Fikrin en zayıf veya riskli 3 yönü")
    competitors_advice: str = Field(description="Rakiplere karşı izlenmesi gereken stratejik mentor tavsiyesi")
    final_verdict: str = Field(description="Girişim mentorünün nihai kararı (Pivot mu, devam mı?)")


# =====================================================================
# --- 5. GÜN: MEDIUM / İÇERİK ÜRETİCİ ASİSTANI ŞEMALARI ---
# =====================================================================
class MediumResponse(BaseModel):
    target_topic: str = Field(description="İçerik üretilen ana konu")
    suggested_titles: List[str] = Field(description="Dikkat çekici 3 farklı makale başlığı önerisi")
    article_outline: str = Field(description="Makalenin alt başlıkları ve iskelet yapısı")
    tags: List[str] = Field(description="Erişimi artırmak için önerilen 5 etiket (tag)")


# =====================================================================
# --- 8. GÜN: GELİŞTİRİCİ PROJE ELEŞTİRMEN ŞEMASI ---
# =====================================================================
class DevEvaluationResponse(BaseModel):
    user_project: str = Field(description="Kullanıcının geliştirmek istediği proje")
    technical_complexity_score: int = Field(description="100 üzerinden projenin teknik derinlik ve karmaşıklık puanı")
    cv_impact_score: int = Field(description="100 üzerinden bu projenin bir yazılımcının CV'sine yapacağı etki puanı")
    recommended_stack: List[str] = Field(description="Bu projede kullanılması önerilen teknoloji yığını")
    engineering_challenges: List[str] = Field(description="Geliştiricinin karşılaşacağı 3 zorlu mühendislik problemi")
    learning_outcomes: List[str] = Field(description="Proje sonunda kazanılacak teknik yetkinlikler")
    final_mentor_verdict: str = Field(description="Kıdemli mühendisin geliştiriciye sunduğu nihai mentor tavsiyesi")


# =====================================================================
# --- 8. GÜN: PROJE ÖNERİ ŞEMALARI ---
# =====================================================================
class ProjectSuggestionItem(BaseModel):
    title: str = Field(description="Önerilen projenin başlığı")
    description: Optional[str] = Field(default=None, description="Projenin detaylı açıklaması")
    short_desc: str = Field(description="Projenin kısa ve vurucu özeti")
    difficulty: str = Field(description="Projenin zorluk seviyesi")

class ProjectSuggestionsResponse(BaseModel):
    area: str = Field(description="Arama yapılan teknolojik veya sektörel alan")
    suggestions: List[ProjectSuggestionItem] = Field(description="CV'de parlayacak 4 adet özgün proje önerisi")


# =====================================================================
# --- 10. GÜN: RADAR VERİ ÖZETLEME VE RAG ŞEMASI ---
# =====================================================================
class RadarSummaryRequest(BaseModel):
    raw_data: List[dict] = Field(description="Özetlenmek üzere gönderilen canlı radar verileri listesi")

class RadarSummaryResponse(BaseModel):
    tldr_summary: str = Field(description="Yapay zeka dünyasında bugün ne oluyor? Genel özet (TL;DR)")
    market_opportunities: List[str] = Field(description="Bu verilere bakarak üretilebilecek 3 stratejik ürün fırsatı")
    architectural_trends: List[str] = Field(description="Geliştiricilerin kullanmaya başladığı en yeni mimari yaklaşımlar")


# =====================================================================
# --- MULTI-AGENT / SİNERJİ SİMÜLASYONU VE ALT AJAN ŞEMALARI ---
# =====================================================================
class CTOAnalysis(BaseModel):
    software_architecture: str = Field(description="Yazılım mimarisi ve teknoloji yığını")
    database_design: str = Field(description="Veritabanı tasarimi ve şema yapısı")
    security_infrastructure: str = Field(description="Güvenlik altyapısı ve siber güvenlik önlemleri")

class CEOAnalysis(BaseModel):
    target_audience: str = Field(description="Hedef kitle ve müşteri segmentasyonu")
    revenue_models: List[str] = Field(description="Gelir modelleri ve bütçe planları")
    go_to_market_strategy: str = Field(description="Pazara giriş (GTM) ve büyüme stratejisi")

class AgentDebateAnalysis(BaseModel):
    cto_criticism: str = Field(description="CTO'nun CEO iş modeline getirdiği teknik eleştiriler")
    ceo_criticism: str = Field(description="CEO'nun CTO mimarisine getirdiği ticari eleştiriler")
    mvp_consensus: str = Field(description="Ortak noktada buluşulan nihai MVP planı")

class CompetitorInfo(BaseModel):
    name: str = Field(description="Rakip ürünün adı")
    weakness: str = Field(description="Rakibin en zayıf yönü")
    our_advantage: str = Field(description="Rakibe karşı yaratacağımız haksız avantajımız")

class CompetitorAnalysis(BaseModel):
    competitors: List[CompetitorInfo] = Field(description="En yakın rakiplerin listesi")
    positioning_strategy: str = Field(description="Pazardaki benzersiz konumlandırma stratejimiz")

class CostItem(BaseModel):
    name: str = Field(description="Gider kaleminin adı")
    amount: float = Field(description="USD cinsinden maliyeti")
    is_recurring: bool = Field(description="Bu giderin her ay tekrarlanıp tekrarlanmayacağı")

class FinancialAnalysis(BaseModel):
    initial_mvp_cost: float = Field(description="MVP için gereken ilk kurulum bütçesi")
    monthly_burn_rate: float = Field(description="Aylık toplam operasyonel gider")
    break_even_months: int = Field(description="Kâra geçileceği tahmin edilen ay sayısı")
    costs_breakdown: List[CostItem] = Field(description="Detaylı bütçe ve gider kalemleri")

class GrowthTactics(BaseModel):
    acquisition_channel: str = Field(description="Kullanıcı edinme kanalı")
    activation_tactic: str = Field(description="İlk 10 saniyede etki (Aha Moment) yaratma yöntemi")
    viral_loop: str = Field(description="Viral yayılma ve referans mekanizması")

class GrowthAnalysis(BaseModel):
    growth_strategy_title: str = Field(description="Önerilen büyüme stratejisinin adı")
    funnel_tactics: GrowthTactics = Field(description="AARRR hunisi bazlı büyüme taktikleri")
    recommended_tools: List[str] = Field(description="Büyümeyi yönetmek için kullanılacak araçlar")

class LegalRequirement(BaseModel):
    title: str = Field(description="Yasal zorunluluk başlığı")
    description: str = Field(description="Yasal zorunluluk açıklaması")
    risk_level: str = Field(description="Ceza ve risk seviyesi (Kritik, Yüksek, vb.)")

class TechnicalRisk(BaseModel):
    risk_name: str = Field(description="Teknik risk adı")
    mitigation_plan: str = Field(description="Riski azaltma planı")

class LegalAndRiskAnalysis(BaseModel):
    legal_strategy_title: str = Field(description="Yasal koruma stratejisinin adı")
    legal_requirements: List[LegalRequirement] = Field(description="En kritik 2 yasal zorunluluk")
    technical_risks: List[TechnicalRisk] = Field(description="En kritik 2 teknik risk")

class TestCaseResult(BaseModel):
    endpoint: str = Field(description="Test edilen API uç noktası")
    status: str = Field(description="Test sonucu (PASSED / FAILED)")
    response_time_ms: int = Field(description="Milisaniye cinsinden yanıt süresi")
    validation_notes: str = Field(description="Doğrulama ve test süreci notu")

class QAAnalysis(BaseModel):
    test_suite_title: str = Field(description="Test otomasyon paketinin başlığı")
    overall_health_score: int = Field(description="Sistem genel sağlık skoru")
    test_cases: List[TestCaseResult] = Field(description="Entegrasyon ve şema test senaryoları")
    critical_vulnerabilities: List[str] = Field(description="Kapatılması gereken kritik açıklar")

class PerformanceMetrics(BaseModel):
    total_tokens_saved: int = Field(description="Önbellek sayesinde kurtarılan token sayısı")
    cost_saved_usd: float = Field(description="Mali tasarruf (USD)")
    api_latency_reduction_percent: int = Field(description="Yüzdesel hızlanma oranı")
    cache_status: str = Field(description="Önbellek durumu (HIT/MISS)")

class PerformanceAnalysis(BaseModel):
    monitor_title: str = Field(description="Performans izleme panelinin başlığı")
    metrics: PerformanceMetrics = Field(description="Sistem genel verimlilik göstergeleri")
    bottlenecks: List[str] = Field(description="Darboğazlar")

class UserPersonaAnalysis(BaseModel):
    persona_name: str = Field(description="Sanal kullanıcının adı")
    demographics: str = Field(description="Demografik özellikleri")
    pain_points: List[str] = Field(description="Kullanıcının yaşadığı 3 problem")
    brutal_feedback: str = Field(description="Acımasız eleştiri metni")
    adoption_score: int = Field(description="Ürünü satın alma ihtimali puanı")

class MultiAgentOrchestratorResponse(BaseModel):
    project_title: str
    cto_report: CTOAnalysis
    ceo_report: CEOAnalysis
    synergy_summary: str
    user_test: UserPersonaAnalysis
    debate_report: AgentDebateAnalysis
    competitor_report: CompetitorAnalysis
    financial_report: FinancialAnalysis
    growth_report: GrowthAnalysis
    legal_report: LegalAndRiskAnalysis
    qa_report: QAAnalysis
    performance_report: PerformanceAnalysis