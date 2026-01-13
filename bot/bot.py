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
from database import init_db, save_user_profile, get_user_profile
from schemas import UserProfile
from middleware.admin_middleware import AdminMiddleware
from commands.user_commands import user_router
from commands.admin_commands import admin_router
from menu_setup import set_bot_commands

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

# Подключение middleware
dp.message.middleware(AdminMiddleware())
dp.callback_query.middleware(AdminMiddleware())

# Подключение роутеров
dp.include_router(user_router)
dp.include_router(admin_router)

# Состояния FSM (оставляем для совместимости)
class ProfileStates(StatesGroup):
    waiting_for_profile = State()

# Заглушка для сохранения профиля из MiniApp
@dp.message(Command("save_profile"))
async def save_profile(message: Message) -> None:
    """Сохранение профиля из MiniApp (webhook/API)"""
    user_id = message.from_user.id
    # Для примера: данные профиля приходят тут в виде dict.
    profile_data = {"name": "Пример", "age": 25, "interests": "ужины"}

    # Валидация через pydantic (UserProfile). Исключение поймается aiogram/логером.
    try:
        validated = UserProfile(**profile_data)
    except Exception as e:
        await message.answer(f"Ошибка в данных профиля: {e}")
        return

    await save_user_profile(user_id, validated)
    await message.answer("Профиль сохранён! Теперь можешь искать компанию.")

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