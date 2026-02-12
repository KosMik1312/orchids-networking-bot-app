# Конфигурация бота
import os
from typing import Optional

# Базовая директория (папка bot/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Загружаем .env файл из директории bot/ (если он есть)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, ".env"))
except Exception:
    # python-dotenv может не быть установлен в некоторых окружениях — тогда переменные берутся из окружения
    pass
# ===== ТОКЕНЫ И СЕКРЕТЫ (читаются из окружения / .env) =====
# По соображениям безопасности секреты не задаются в коде.
# Заполните эти переменные в файле .env на сервере или в системных переменных.
BOT_TOKEN = os.getenv("BOT_TOKEN")
MINIAPP_URL = os.getenv("MINIAPP_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

# ID администраторов
_admin_ids_env = os.getenv("ADMIN_IDS", "")
if _admin_ids_env:
    try:
        ADMIN_IDS = [int(x.strip()) for x in _admin_ids_env.split(",") if x.strip()]
    except ValueError:
        ADMIN_IDS = []
# По умолчанию список админов пуст — укажите ADMIN_IDS в .env
else:
    ADMIN_IDS = []

# Отключить проверку JWT (для разработки). Если true — все защищённые эндпоинты пропускают аутентификацию.
AUTH_DISABLED = os.getenv("AUTH_DISABLED", "false").lower() == "true"

# ===== КОНФИГУРАЦИЯ БД =====
# Поддерживает как SQLite (локальная разработка), так и PostgreSQL (production)

# Способ 1: Использовать DATABASE_URL (рекомендуется для production)
# Примеры:
#   - SQLite:     sqlite+aiosqlite:///path/to/database.db
#   - PostgreSQL: postgresql+asyncpg://user:password@localhost:5432/dbname
DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

# Способ 2: Если DATABASE_URL не задана, используем старую конфигурацию (для совместимости)
if not DATABASE_URL:
    # Тип БД (sqlite или postgresql)
    DB_TYPE = os.getenv("DB_TYPE", "sqlite").lower()
    
    if DB_TYPE == "sqlite":
        _database_name_raw = os.getenv("DATABASE_NAME", "allora.db")
        db_path = _database_name_raw if os.path.isabs(_database_name_raw) else os.path.join(BASE_DIR, _database_name_raw)
        DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"
        DATABASE_NAME = db_path  # Для обратной совместимости
    elif DB_TYPE == "postgresql":
        # PostgreSQL конфигурация (ФИКСИРОВАННЫЕ ЗНАЧЕНИЯ)
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "5432")
        DB_USER = os.getenv("DB_USER", "allora_user")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "31642300")
        DB_NAME = os.getenv("DB_NAME", "allora_db")
        
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        DATABASE_NAME = DB_NAME  # Для обратной совместимости
    else:
        raise ValueError(f"Unknown DB_TYPE: {DB_TYPE}")
else:
    # Если DATABASE_URL задана, извлекаем имя БД для обратной совместимости
    if "sqlite" in DATABASE_URL:
        DATABASE_NAME = DATABASE_URL.split("///")[-1]
    else:
        DATABASE_NAME = DATABASE_URL.split("/")[-1]

# ===== ПАРАМЕТРЫ ПОДКЛЮЧЕНИЯ =====
# Pooling для оптимизации подключений к БД
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
DB_POOL_MAX_OVERFLOW = int(os.getenv("DB_POOL_MAX_OVERFLOW", "10"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "3600"))  # Переиспользовать соединения каждый час

# Echo SQL queries (для отладки)
DB_ECHO = os.getenv("DB_ECHO", "false").lower() == "true"

# Логирование
import logging
if DB_ECHO:
    logging.basicConfig()
    logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)