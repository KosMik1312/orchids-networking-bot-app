"""
Модуль для работы с токенами пользователей.
Использует JWT для безопасной передачи Telegram ID из бота в фронтенд.
"""
import jwt
import time
from config import SECRET_KEY

# Время жизни токена: 24 часа
TOKEN_EXPIRY = 24 * 60 * 60


def generate_user_token(user_id: int) -> str:
    """
    Генерирует JWT токен для пользователя.
    Токен содержит user_id и время создания.
    
    Args:
        user_id: Telegram ID пользователя
        
    Returns:
        Подписанный JWT токен
    """
    payload = {
        'user_id': user_id,
        'iat': int(time.time()),
        'exp': int(time.time()) + TOKEN_EXPIRY
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
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
        return {
            'user_id': payload['user_id'],
            'valid': True
        }
    except jwt.ExpiredSignatureError:
        print(f"Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
