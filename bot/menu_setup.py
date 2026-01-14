from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeAllPrivateChats
from config import ADMIN_IDS
import logging

logger = logging.getLogger(__name__)

async def set_bot_commands(bot: Bot):
    """Настройка команд бота для разных ролей"""
    
    # Команды для обычных пользователей (скрытые)
    user_commands = [
        BotCommand(command="start", description="🚀 Начать работу с ботом")
    ]
    
    # Команды для администраторов
    admin_commands = [
        BotCommand(command="start", description="🚀 Начать работу с ботом"),
        BotCommand(command="admin", description="🔧 Панель администратора"),
    ]
    
    try:
        # Устанавливаем команды по умолчанию (для групповых чатов и т.д.)
        await bot.set_my_commands(user_commands, BotCommandScopeDefault())
        logger.info("Default commands set successfully")
        
        # Устанавливаем расширенные команды для всех приватных чатов
        await bot.set_my_commands(admin_commands, BotCommandScopeAllPrivateChats())
        logger.info("Private chat commands set successfully")
            
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