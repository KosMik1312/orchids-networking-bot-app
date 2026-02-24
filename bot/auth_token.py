"""
Модуль для работы с аутентификацией Telegram Users.
Поддерживает гибридную аутентификацию:
- Telegram WebApp initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- JWT токены (для локального тестирования / альтернативных клиентов)
"""
import json
import hmac
import hashlib
import time
import jwt
from urllib.parse import parse_qs, unquote
from config import SECRET_KEY, BOT_TOKEN
from logger import get_api_logger

logger = get_api_logger()


def validate_init_data(init_data: str) -> dict | None:
    """
    Проверяет Telegram initData и возвращает данные пользователя.
    
    Telegram docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    
    Args:
        init_data: URL-encoded строка с initData от Telegram WebApp
        
    Returns:
        dict с 'user_id' если initData валиден, None если невалиден
    """
    if not init_data:
        logger.warning("❌ Empty initData")
        return None
    
    logger.info(f"🔍 Validating initData (first 100 chars): {init_data[:100]}...")
        
    try:
        # Парсим initData как URLSearchParams
        params = {}
        for part in init_data.split('&'):
            if '=' in part:
                key, value = part.split('=', 1)
                params[unquote(key)] = unquote(value)
        
        logger.info(f"📋 Parsed params keys: {list(params.keys())}")
        
        # Извлекаем hash для верификации
        provided_hash = params.get('hash')
        if not provided_hash:
            logger.warning("⚠️ No hash in initData")
            return None
        
        logger.info(f"🔐 Found hash: {provided_hash[:20]}...")
        
        # Создаём data_check_string для верификации
        # Формат: ключ1=значение1\nключ2=значение2\n...
        # Исключая сам hash
        data_to_check = []
        for key in sorted(params.keys()):
            if key != 'hash':
                data_to_check.append(f"{key}={params[key]}")
        
        data_check_string = '\n'.join(data_to_check)
        logger.info(f"📋 Data to check (first 200 chars): {data_check_string[:200]}...")
        
        # Вычисляем HMAC-SHA256
        # SECRET_KEY это Bot Token, но мы должны использовать его как ключ для HMAC
        secret = hmac.new(b'WebAppData', BOT_TOKEN.encode(), hashlib.sha256).digest()
        computed_hash = hmac.new(secret, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        logger.info(f"🔐 Provided hash: {provided_hash}")
        logger.info(f"🔐 Computed hash: {computed_hash}")
        
        # Сравниваем хеши
        if computed_hash != provided_hash:
            logger.warning("❌ Hash mismatch - initData is invalid")
            return None
        
        logger.info(f"✅ Hash matches!")
        
        # Проверяем timestamp (не старше 5 минут)
        auth_date = int(params.get('auth_date', 0))
        current_time = int(time.time())
        time_diff = current_time - auth_date
        
        logger.info(f"⏰ Auth date: {auth_date}, current time: {current_time}, diff: {time_diff}s")
        
        if time_diff > 86400:  # 24 часа (согласно требованиям удобства использования)
            logger.warning(f"⏰ InitData too old: {time_diff} seconds ago")
            return None
        
        logger.info(f"✅ Timestamp valid")
        
        # Парсим user JSON
        user_str = params.get('user')
        if not user_str:
            logger.warning("⚠️ No user data in initData")
            return None
        
        logger.info(f"👤 User data (first 100 chars): {user_str[:100]}...")
        
        user_data = json.loads(user_str)
        user_id = user_data.get('id')
        
        if not user_id:
            logger.warning("❌ No user_id in user data")
            return None
        
        logger.info(f"✅ InitData valid for user_id={user_id}")
        logger.info(f"👤 User data: {user_data}")
        return {
            'user_id': user_id,
            'valid': True,
            'user_data': user_data
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error in initData: {e}")
        logger.error(f"   User string was: {params.get('user', 'NOT FOUND')}")
        return None
    except Exception as e:
        logger.error(f"❌ Error validating initData: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def generate_user_token(user_id: int) -> str:
    """
    Генерирует JWT токен для пользователя.
    Используется для локального тестирования и альтернативных клиентов.
    
    Args:
        user_id: Telegram ID пользователя
        
    Returns:
        Подписанный JWT токен
    """
    payload = {
        'user_id': user_id,
        'iat': int(time.time()),
        'exp': int(time.time()) + (24 * 60 * 60)  # 24 часа
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    logger.info(f"📝 Generated JWT token for user_id={user_id}")
    return token


def validate_user_token(token: str) -> dict | None:
    """
    Проверяет JWT токен и возвращает данные пользователя.
    
    Args:
        token: JWT токен
        
    Returns:
        dict с 'user_id' если токен валиден, None если токен невалиден или истёк
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        logger.info(f"✅ JWT token valid for user_id={payload['user_id']}")
        return {
            'user_id': payload['user_id'],
            'valid': True
        }
    except jwt.ExpiredSignatureError:
        logger.warning(f"⏰ JWT token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"❌ Invalid JWT token: {e}")
        return None


def validate_auth_header(auth_header: str) -> dict | None:
    """
    🎯 ГИБРИДНАЯ АУТЕНТИФИКАЦИЯ (по документации Telegram API)
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    
    Валидирует аутентификацию в следующем порядке:
    1. Как Telegram initData (основное для продакшена в Telegram MiniApp)
    2. Как JWT токен (для локального тестирования и альтернативных клиентов)
    
    Args:
        auth_header: Значение Authorization заголовка (без "Bearer " префикса)
        
    Returns:
        dict с 'user_id' если аутентификация успешна, None если ошибка
    """
    if not auth_header:
        logger.warning("❌ Empty auth header")
        return None
    
    # 1️⃣ Сначала пытаемся валидировать как Telegram initData
    logger.info(f"🔍 Attempting validation as Telegram initData...")
    result = validate_init_data(auth_header)
    if result:
        logger.info(f"✅ Authentication successful via Telegram initData")
        return result
    
    # 2️⃣ Если initData не работает - пытаемся как JWT токен
    logger.info(f"🔍 Attempting validation as JWT token...")
    jwt_result = validate_user_token(auth_header)
    if jwt_result:
        logger.info(f"✅ Authentication successful via JWT token")
        return jwt_result
    
    logger.error(f"❌ Authentication failed - invalid initData and invalid JWT token")
    return None