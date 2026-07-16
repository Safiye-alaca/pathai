import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./pathai.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 1. Değerlendirme Geçmişi Tablosu ---
class EvaluationHistory(Base):
    __tablename__ = "evaluation_history"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, index=True)       # 'startup' veya 'dev'
    user_input = Column(Text)               # Kullanıcının yazdığı fikir/proje
    ai_response = Column(Text)              # Gelen JSON yanıtın metin hali
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# --- 2. Kullanıcı Bellek ve Bağlam Tablosu ---
class UserContext(Base):
    __tablename__ = "user_context"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, default="default_user")
    last_searched_sector = Column(String, nullable=True)           # En son aranan sektör
    last_selected_project = Column(String, nullable=True)          # En son seçilen proje
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# --- 3. Çoklu Ajan Simülasyon Önbellek Tablosu ---
class MultiAgentHistory(Base):
    __tablename__ = "multi_agent_history"

    id = Column(Integer, primary_key=True, index=True)
    original_title = Column(String, nullable=False)
    normalized_title = Column(String, unique=True, index=True, nullable=False)
    sector = Column(String, nullable=False)
    
    # Raporlar JSON formatında saklanır
    cto_report_json = Column(String, nullable=False)
    ceo_report_json = Column(String, nullable=False)
    synergy_summary = Column(String, nullable=False)
    user_test_json = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

# Bağımlılık Enjeksiyonu (Dependency Injection) için DB oturum fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()