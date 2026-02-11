from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from config import ADMIN_IDS
import logging

logger = logging.getLogger(__name__)

class AdminMiddleware(BaseMiddleware):
    """Middleware для проверки прав администратора"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        user_id = event.from_user.id
        
        # Добавляем информацию о том, является ли пользователь админом
        is_admin = user_id in ADMIN_IDS
        data["is_admin"] = is_admin
        
        logger.info(f"🔍 AdminMiddleware: user_id={user_id}, is_admin={is_admin}, ADMIN_IDS={ADMIN_IDS}")
        
        # Логируем попытки доступа к админ-командам
        if hasattr(event, 'text') and event.text and event.text.startswith('/admin'):
            logger.info(f"👤 User {user_id} issued /admin command. is_admin={is_admin}")
            if not is_admin:
                logger.warning(f"❌ Unauthorized admin access attempt by user {user_id}")
                await event.answer("❌ У вас нет прав для выполнения этой команды.")
                return
        
        return await handler(event, data)