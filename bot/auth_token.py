"""
Модуль для работы с аутентификацией Telegram Users.
Использует Telegram WebApp initData для безопасной валидации.
"""
import json
import hmac
import hashlib
import time
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
        
    try:
        # Парсим initData как URLSearchParams
        params = {}
        for part in init_data.split('&'):
            if '=' in part:
                key, value = part.split('=', 1)
                params[unquote(key)] = unquote(value)
        
        # Извлекаем hash для верификации
        provided_hash = params.get('hash')
        if not provided_hash:
            logger.warning("⚠️ No hash in initData")
            return None
        
        # Создаём data_check_string для верификации
        # Формат: ключ1=значение1\nключ2=значение2\n...
        # Исключая сам hash
        data_to_check = []
        for key in sorted(params.keys()):
            if key != 'hash':
                data_to_check.append(f"{key}={params[key]}")
        
        data_check_string = '\n'.join(data_to_check)
        logger.info(f"📋 Data to check: {data_check_string[:100]}...")
        
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
        
        # Проверяем timestamp (не старше 5 минут)
        auth_date = int(params.get('auth_date', 0))
        current_time = int(time.time())
        time_diff = current_time - auth_date
        
        if time_diff > 300:  # 5 минут
            logger.warning(f"⏰ InitData too old: {time_diff} seconds ago")
            return None
        
        logger.info(f"✅ InitData valid. Auth date: {auth_date}, current: {current_time}")
        
        # Парсим user JSON
        user_str = params.get('user')
        if not user_str:
            logger.warning("⚠️ No user data in initData")
            return None
        
        user_data = json.loads(user_str)
        user_id = user_data.get('id')
        
        if not user_id:
            logger.warning("❌ No user_id in user data")
            return None
        
        logger.info(f"✅ InitData valid for user_id={user_id}")
        return {
            'user_id': user_id,
            'valid': True,
            'user_data': user_data
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error in initData: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Error validating initData: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None