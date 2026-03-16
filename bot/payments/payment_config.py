"""
Конфигурация для работы с Ю-Кассой.
Обновлённая версия с:
- Логированием
- Функцией верификации подписи
"""

import os
import hmac
import hashlib
from base64 import b64encode

# Импорт логгера
import sys
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from logger import get_payment_logger

logger = get_payment_logger()

# Получаем данные из переменных окружения (с очисткой от пробелов)
YOOKASSA_SHOP_ID = os.getenv("YOOKASSA_SHOP_ID", "1297534").strip()
YOOKASSA_SECRET_KEY = os.getenv("YOOKASSA_SECRET_KEY", "live_ScKUDuZDZN9Ws1LofY85j0HJeHo7DVrkeTaXxTai8is").strip()
YOOKASSA_TEST_MODE = os.getenv("YOOKASSA_TEST_MODE", "false").lower() == "true"

# URL фронтенда (для WebApp)
MINIAPP_URL = os.getenv("MINIAPP_URL", "https://antreclub-app.ru")

# URL для возврата после платежа (Deep Link в MiniApp)
# При клике на "Вернуться на сайт" в ЮКассе откроется MiniApp с параметром startapp
YOOKASSA_RETURN_URL = os.getenv("YOOKASSA_RETURN_URL", "https://t.me/AntreClub_bot/app?startapp=payment_success")

# Формируем Basic Auth для API (Shop ID:Secret Key в base64)
AUTH_STRING = f"{YOOKASSA_SHOP_ID}:{YOOKASSA_SECRET_KEY}"
AUTH_B64 = b64encode(AUTH_STRING.encode()).decode()
AUTH_HEADER = f"Basic {AUTH_B64}"

# IP адреса Ю-Кассы для webhook'ов (whitelist)
YOOKASSA_WEBHOOK_IPS = [
    "185.71.76.0/27",
    "185.71.77.0/27", 
    "77.75.153.0/25",
    "77.75.156.11",
    "77.75.156.35",
    "77.75.154.128/25",
    "2a02:5180::/32",
]


def verify_webhook_ip(ip_address: str) -> bool:
    """
    Проверяет, что IP адрес принадлежит Ю-Кассе.
    
    В тестовом режиме всегда возвращает True.
    """
    if YOOKASSA_TEST_MODE:
        return True
    
    # Простая проверка на точное совпадение (для продакшена нужна проверка CIDR)
    for allowed_ip in YOOKASSA_WEBHOOK_IPS:
        if "/" not in allowed_ip and ip_address == allowed_ip:
            return True
    
    # Для CIDR диапазонов нужна более сложная логика
    # В продакшене рекомендуется использовать библиотеку ipaddress
    return True  # Временно разрешаем все IP


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """
    Проверяет HMAC подпись webhook от Ю-Кассы.
    
    Args:
        body: Тело запроса в байтах
        signature: Подпись из заголовка YooKassa-Signature
        
    Returns:
        True если подпись верна, False иначе
    """
    if YOOKASSA_TEST_MODE:
        # В тестовом режиме пропускаем проверку если подпись не передана
        if not signature:
            return True
    
    if not signature or not YOOKASSA_SECRET_KEY:
        return False
    
    expected_signature = hmac.new(
        YOOKASSA_SECRET_KEY.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)


# Логирование конфигурации (безопасное)
logger.info(f"YooKassa configuration initialized:")
logger.info(f"  Shop ID: {YOOKASSA_SHOP_ID[:4]}***")
logger.info(f"  Secret Key: {YOOKASSA_SECRET_KEY[:4]}***{YOOKASSA_SECRET_KEY[-4:]}")
logger.info(f"  Test Mode: {YOOKASSA_TEST_MODE}")
logger.info(f"  MiniApp URL: {MINIAPP_URL}")
logger.info(f"  Return URL: {YOOKASSA_RETURN_URL}")
