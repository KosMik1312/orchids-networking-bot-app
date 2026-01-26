"""
Конфигурация для работы с Ю-Кассой.
"""

import os
from base64 import b64encode

# Получаем данные из переменных окружения
YOOKASSA_SHOP_ID = os.getenv("YOOKASSA_SHOP_ID", "100500")  # Demo Shop ID по умолчанию
YOOKASSA_SECRET_KEY = os.getenv("YOOKASSA_SECRET_KEY", "test_1234567890abcdef")  # Demo Secret Key
YOOKASSA_TEST_MODE = os.getenv("YOOKASSA_TEST_MODE", "true").lower() == "true"

# URL для возврата после платежа (может переопределяться при запросе)
DEFAULT_RETURN_URL = os.getenv("YOOKASSA_RETURN_URL", "https://orchids-networking-bot-app.vercel.app/")

# Формируем Basic Auth для API (Shop ID:Secret Key в base64)
AUTH_STRING = f"{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}"
AUTH_B64 = b64encode(AUTH_STRING.encode()).decode()
AUTH_HEADER = f"Basic {AUTH_B64}"

# Информация о конфигурации
print(f"\n[CONFIG] YooKassa initialized:")
print(f"  Shop ID: {YOOKASSA_SHOP_ID}")
print(f"  Test Mode: {YOOKASSA_TEST_MODE}")
print(f"  Return URL: {DEFAULT_RETURN_URL}")
print()
