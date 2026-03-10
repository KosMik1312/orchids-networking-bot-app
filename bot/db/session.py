"""
Управление сессиями базы данных.
Обновлённая версия с централизованным логированием.
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

from config import DATABASE_URL, DB_POOL_SIZE, DB_POOL_MAX_OVERFLOW, DB_POOL_RECYCLE, DB_ECHO
from .models import Base

# Импорт логгера
import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from logger import get_db_logger

logger = get_db_logger()

# ===== ИНИЦИАЛИЗАЦИЯ ASYNC ENGINE =====
logger.info(f"Database configuration:")
logger.info(f"  DATABASE_URL: {DATABASE_URL}")
logger.info(f"  Pool size: {DB_POOL_SIZE}")
logger.info(f"  Echo SQL: {DB_ECHO}")

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
    engine_kwargs["connect_args"] = {"timeout": 30, "check_same_thread": False}
    logger.info("Using SQLite with async driver")
elif "postgresql" in DATABASE_URL.lower():
    logger.info("Using PostgreSQL with asyncpg driver")

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
    logger.info("Initializing database...")
    try:
        async with engine.begin() as conn:
            # Создаем все таблицы согласно ORM моделям
            await conn.run_sync(Base.metadata.create_all)

            # Безопасное добавление колонки price в существующую БД
            from sqlalchemy import text
            try:
                await conn.execute(text("ALTER TABLE dinner_slots ADD COLUMN price INTEGER DEFAULT 10"))
            except Exception:
                # Если колонка уже существует, будет ошибка, которую мы игнорируем
                pass
        
        logger.info("✅ Database initialized successfully!")
    except Exception as e:
        logger.error(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        raise


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость (dependency) для получения асинхронной сессии.
    Используется в репозиториях для выполнения запросов.
    """
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Session error, rolling back: {e}")
            raise
        finally:
            await session.close()


async def close_db():
    """
    Закрывает все соединения с БД.
    Вызывается при завершении приложения.
    """
    await engine.dispose()
    logger.info("Database connections closed")
