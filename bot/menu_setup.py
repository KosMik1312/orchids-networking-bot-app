from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault, BotCommandScopeChat
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
        # Сначала удаляем все команды, чтобы избежать конфликтов
        await bot.delete_my_commands(BotCommandScopeDefault())
        for admin_id in ADMIN_IDS:
            await bot.delete_my_commands(BotCommandScopeChat(chat_id=admin_id))
        
        # Устанавливаем команды по умолчанию (для обычных пользователей)
        await bot.set_my_commands(user_commands, BotCommandScopeDefault())
        logger.info("User commands set successfully")
        
        # Устанавливаем команды для каждого администратора
        for admin_id in ADMIN_IDS:
            await bot.set_my_commands(
                admin_commands, 
                BotCommandScopeChat(chat_id=admin_id)
            )
            logger.info(f"Admin commands set for user {admin_id}")
            
    except Exception as e:
        logger.error(f"Error setting bot commands: {e}")

async def remove_bot_commands(bot: Bot):
    """Удаление команд бота (для отладки)"""
    try:
        await bot.delete_my_commands(BotCommandScopeDefault())
        
        for admin_id in ADMIN_IDS:
            await bot.delete_my_commands(BotCommandScopeChat(chat_id=admin_id))
            
        logger.info("All bot commands removed")
    except Exception as e:
        logger.error(f"Error removing bot commands: {e}")