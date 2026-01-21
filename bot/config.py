# Конфигурация бота
import os

# Базовая директория (папка bot/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Токен бота (по возможности храните в переменных окружения)
BOT_TOKEN = os.getenv("BOT_TOKEN", "8121198859:AAEY7nBbJjHBd7RZ4BbYOKHBBMCyNF3ydEg")

# URL MiniApp
MINIAPP_URL = os.getenv("MINIAPP_URL", "https://orchids-networking-bot-app.vercel.app")

# Секретный ключ для подписи токенов пользователей
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-12345")

# ID администраторов (можно задать через переменные окружения, разделённые запятой)
_admin_ids_env = os.getenv("ADMIN_IDS", "")
if _admin_ids_env:
    try:
        ADMIN_IDS = [int(x.strip()) for x in _admin_ids_env.split(",") if x.strip()]
    except ValueError:
        ADMIN_IDS = []
else:
    ADMIN_IDS = [
        432235211,
        5122343544,
    ]

# Путь к базе данных.
# Важно: на сервере текущая рабочая директория может отличаться,
# поэтому приводим относительный путь к абсолютному относительно bot/.
_database_name_raw = os.getenv("DATABASE_NAME", "allora.db")
DATABASE_NAME = _database_name_raw if os.path.isabs(_database_name_raw) else os.path.join(BASE_DIR, _database_name_raw)