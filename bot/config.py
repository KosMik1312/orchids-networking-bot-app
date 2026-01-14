# Конфигурация бота
import os

# Токен бота (по возможности храните в переменных окружения)
BOT_TOKEN = os.getenv("BOT_TOKEN", "8121198859:AAEY7nBbJjHBd7RZ4BbYOKHBBMCyNF3ydEg")

# URL MiniApp
MINIAPP_URL = os.getenv("MINIAPP_URL", "https://orchids-networking-bot-app.vercel.app")

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
	    5122343544
    ]

# Название базы данных
DATABASE_NAME = os.getenv("DATABASE_NAME", "allora.db")