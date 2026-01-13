from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

from bot.config import DATABASE_NAME
from .models import Base

# Создаем асинхронный "движок" для взаимодействия с БД
# echo=True - полезно для отладки, выводит все SQL-запросы в консоль
engine = create_async_engine(f"sqlite+aiosqlite:///{DATABASE_NAME}")

# Создаем фабрику сессий, которая будет создавать новые сессии по запросу
# expire_on_commit=False - важно для асинхронного кода, чтобы объекты были доступны после коммита
async_session_factory = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def init_db():
    """
    Инициализирует базу данных: создает все таблицы на основе моделей.
    """
    async with engine.begin() as conn:
        # В production можно использовать Alembic для миграций
        await conn.run_sync(Base.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость (dependency) для получения асинхронной сессии.
    Используется в репозиториях для выполнения запросов.
    """
    async with async_session_factory() as session:
        yield session
