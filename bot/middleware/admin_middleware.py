from typing import Callable, Dict, Any, Awaitable
from aiogram import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from config import ADMIN_IDS
import logging

logger = logging.getLogger(__name__)

class AdminMiddleware(BaseMiddleware):
    """Middleware для проверки прав администратора
    
    ✅ ДВОЙНАЯ ПРОВЕРКА АДМИНИСТРАТОРА:
    1. ADMIN_IDS из конфига (быстрая проверка)
    2. Поле is_admin в БД (основной источник)
    """
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        user_id = event.from_user.id
        
        # Проверяем ОБА источника администратора
        is_admin = user_id in ADMIN_IDS
        
        # Если не в конфиге - проверяем БД
        if not is_admin:
            try:
                from database_helpers import get_session_factory
                from db.repository import UserRepo
                
                async_session = get_session_factory()
                async with async_session() as session:
                    user_repo = UserRepo(session)
                    user = await user_repo.get_user_profile(user_id)
                    if user and user.is_admin:
                        is_admin = True
                        logger.info(f"✅ User {user_id} is admin (is_admin=True in DB)")
            except Exception as e:
                logger.warning(f"⚠️ Could not check DB for admin status: {e}")
        
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