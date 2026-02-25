from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeAllPrivateChats
from config import ADMIN_IDS
import logging

logger = logging.getLogger(__name__)

async def set_bot_commands(bot: Bot):
    """Настройка команд бота для разных ролей"""
    
    # Команды для обычных пользователей (скрываем /admin)
    user_commands = [
        BotCommand(command="start", description="🚀 Начать работу с ботом")
    ]
    
    # Команды для администраторов (видят всё)
    admin_commands = [
        BotCommand(command="start", description="🚀 Начать работу с ботом"),
        BotCommand(command="admin", description="🔧 Панель администратора"),
    ]
    
    try:
        # Устанавливаем команды по умолчанию для всех пользователей
        await bot.set_my_commands(user_commands, BotCommandScopeDefault())
        logger.info("Default commands (user only) set successfully")
        
        # Устанавливаем персональное меню для каждого администратора
        # Это скрывает команду /admin от обычных пользователей
        if ADMIN_IDS:
            for admin_id in ADMIN_IDS:
                try:
                    await bot.set_my_commands(
                        admin_commands, 
                        scope=BotCommandScopeChat(chat_id=admin_id)
                    )
                except Exception as e:
                    logger.warning(f"Could not set specialized menu for admin {admin_id}: {e}")
            logger.info(f"Specialized admin menu set for {len(ADMIN_IDS)} admins")
            
    except Exception as e:
        logger.error(f"Error setting bot commands: {e}")

async def remove_bot_commands(bot: Bot):
    """Удаление команд бота (для отладки)"""
    try:
        await bot.delete_my_commands(BotCommandScopeDefault())
        await bot.delete_my_commands(BotCommandScopeAllPrivateChats())
        logger.info("Bot commands removed successfully")
            
    except Exception as e:
        logger.error(f"Error removing bot commands: {e}")
            
        logger.info("All bot commands removed")
    except Exception as e:
        logger.error(f"Error removing bot commands: {e}")