from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import os
import sys

# Add bot directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import DATABASE_NAME
from .models import Base

# Логирование пути к БД
# DATABASE_NAME теперь нормализован в config.py до абсолютного пути.
db_path = os.path.abspath(DATABASE_NAME)
print(f"\n[DB] Database path: {db_path}")
print(f"[DB] Database name: {DATABASE_NAME}")
print(f"[DB] Current working directory: {os.getcwd()}")

# Создаем асинхронный "движок" для взаимодействия с БД
# echo=True - полезно для отладки, выводит все SQL-запросы в консоль
engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}", echo=False)

# Создаем фабрику сессий, которая будет создавать новые сессии по запросу
# expire_on_commit=False - важно для асинхронного кода, чтобы объекты были доступны после коммита
async_session_factory = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def init_db():
    """
    Инициализирует базу данных: создает все таблицы на основе моделей.
    """
    print(f"[DB] Initializing database...")
    try:
        async with engine.begin() as conn:
            # В production можно использовать Alembic для миграций
            await conn.run_sync(Base.metadata.create_all)
        
        # Проверяем, что файл создался
        if os.path.exists(db_path):
            file_size = os.path.getsize(db_path)
            print(f"[DB] ✅ Database file created successfully")
            print(f"[DB] File path: {db_path}")
            print(f"[DB] File size: {file_size} bytes")
        else:
            print(f"[DB] ⚠️ Database file NOT found at {db_path}")
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
