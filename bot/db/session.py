from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import os
import sys

# Add bot directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DATABASE_URL, DB_POOL_SIZE, DB_POOL_MAX_OVERFLOW, DB_POOL_RECYCLE, DB_ECHO
from .models import Base

# ===== ИНИЦИАЛИЗАЦИЯ ASYNC ENGINE =====
print(f"\n{'='*60}")
print(f"[DB] Database Configuration:")
print(f"[DB] DATABASE_URL: {DATABASE_URL}")
print(f"[DB] Pool size: {DB_POOL_SIZE}")
print(f"[DB] Pool max overflow: {DB_POOL_MAX_OVERFLOW}")
print(f"[DB] Echo SQL: {DB_ECHO}")
print(f"{'='*60}\n")

# Определяем параметры для разных типов БД
engine_kwargs = {
    "echo": DB_ECHO,
    "pool_size": DB_POOL_SIZE,
    "max_overflow": DB_POOL_MAX_OVERFLOW,
    "pool_recycle": DB_POOL_RECYCLE,
}

# Для SQLite не используем pooling (SQLite имеет свои ограничения)
if "sqlite" in DATABASE_URL.lower():
    engine_kwargs.pop("pool_size", None)
    engine_kwargs.pop("max_overflow", None)
    engine_kwargs.pop("pool_recycle", None)
    # SQLite требует connect_args для включения foreign keys и других опций
    engine_kwargs["connect_args"] = {"timeout": 30, "check_same_thread": False}
    print("[DB] ✓ Using SQLite with async driver")
elif "postgresql" in DATABASE_URL.lower():
    print("[DB] ✓ Using PostgreSQL with asyncpg driver")

# Создаем асинхронный движок
engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# Создаем фабрику сессий
async_session_factory = async_sessionmaker(
    engine, 
    expire_on_commit=False, 
    class_=AsyncSession
)

# Экспортируем для использования в других модулях
AsyncSessionLocal = async_session_factory

def get_session_factory():
    """Возвращает фабрику сессий для создания новых сессий"""
    return async_session_factory

def get_async_engine():
    """Возвращает асинхронный движок"""
    return engine

async def init_db():
    """
    Инициализирует базу данных: создает все таблицы на основе моделей.
    Работает как с SQLite, так и с PostgreSQL.
    """
    print(f"[DB] Initializing database...")
    try:
        async with engine.begin() as conn:
            # Создаем все таблицы согласно ORM моделям
            await conn.run_sync(Base.metadata.create_all)
        
        print(f"[DB] ✅ Database initialized successfully!")
    except Exception as e:
        print(f"[DB] ❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        raise

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость (dependency) для получения асинхронной сессии.
    Используется в репозиториях для выполнения запросов.
    """
    async with async_session_factory() as session:
        yield session

async def close_db():
    """
    Закрывает все соединения с БД.
    Вызывается при завершении приложения.
    """
    await engine.dispose()
