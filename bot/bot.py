import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message

# Импорты из нашей структуры
from config import BOT_TOKEN
from db.session import init_db
from db.repository import UserRepo
from middleware.admin_middleware import AdminMiddleware
from commands.user_commands import user_router
from commands.admin_commands import admin_router
from menu_setup import set_bot_commands

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Инициализация бота и диспетчера ---
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

# --- Функции жизненного цикла ---
async def on_startup(bot: Bot):
    """Выполняется при старте бота."""
    logger.info("Initializing database...")
    await init_db()
    logger.info("Setting bot commands...")
    await set_bot_commands(bot)
    logger.info("Bot started successfully.")

async def on_shutdown(dispatcher):
    """Выполняется при остановке бота."""
    logger.info("Bot stopped. Database connections are managed automatically.")

# --- Регистрация компонентов ---
dp.startup.register(on_startup)
dp.shutdown.register(on_shutdown)

# Подключение middleware
dp.message.middleware(AdminMiddleware())
dp.callback_query.middleware(AdminMiddleware())

# Подключение роутеров
dp.include_router(user_router)
dp.include_router(admin_router)

# --- Обработчики (если есть глобальные) ---

# Состояния FSM (оставляем для совместимости, если где-то используются)
class ProfileStates(StatesGroup):
    waiting_for_profile = State()

# Заглушка для сохранения профиля из MiniApp
@dp.message(Command("save_profile"))
async def save_profile(message: Message) -> None:
    """
    Сохранение профиля из MiniApp. 
    В реальном приложении этот эндпоинт будет вызываться не пользователем,
    а через API-запрос от фронтенда.
    """
    user_id = message.from_user.id
    # Для примера: данные профиля приходят тут в виде dict.
    # В реальности, эти данные должен присылать фронтенд.
    profile_data = {"name": "Пример", "age": 25, "interests": "ужины"}

    try:
        # Note: В реальном приложении профиль сохраняется через API
        await message.answer("Профиль можешь сохранить через приложение. Теперь можешь искать компанию.")
    except Exception as e:
        logger.error(f"Profile save failed for user {user_id}: {e}")
        await message.answer(f"Ошибка при сохранении профиля: {e}")

async def main() -> None:
    """Главная функция запуска бота"""
    try:
        # Инициализация базы данных
        await init_db()
        logger.info("Database initialized")
        
        # Настройка команд бота
        await set_bot_commands(bot)
        logger.info("Bot commands configured")
        
        # Запуск бота
        logger.info("Starting bot...")
        await dp.start_polling(bot)
        
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())