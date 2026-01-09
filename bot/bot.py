import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, CallbackQuery
from database import init_db, save_user_profile, get_user_profile

# Токен бота
BOT_TOKEN = "8121198859:AAEY7nBbJjHBd7RZ4BbYOKHBBMCyNF3ydEg"  # Получите у @BotFather

# URL вашего MiniApp
MINIAPP_URL = "https://orchids-networking-bot-app.vercel.app"  # Разверните на Vercel

# Настройка
logging.basicConfig(level=logging.INFO)
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

# Состояния FSM (из найденных проектов)
class ProfileStates(StatesGroup):
    waiting_for_profile = State()

# Приветствие (из Forkies)
WELCOME_TEXT = (
    "Привет! Добро пожаловать в Forkies 💛\n\n"
    "Это сервис тёплых ужинов с интересными незнакомцами, где за одним столом можно встретить «своих» людей.\n\n"
    "Уже больше 2500 человек познакомились на наших встречах, и каждый вечер становится маленькой историей.\n\n"
    "Будем рады открыть для тебя этот формат. Возможно, именно его атмосферы тебе сейчас и не хватало😌\n\n"
    "Всё, что нужно знать о Forkies, собрали в нашем телеграм-канале:\n"
    "🔸 Как проходят встречи\n🔸 В чём особенность формата\n🔸 Отзывы участников\n🔸 Гайд для классного вечера\n🔸 Ответы на вопросы"
)

@dp.message(CommandStart())
async def start_command(message: Message, state: FSMContext) -> None:
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Заполнить анкету", web_app=WebAppInfo(url=MINIAPP_URL))],
        [InlineKeyboardButton(text="Найти компанию", callback_data="find_match")]
    ])
    await message.answer(WELCOME_TEXT, reply_markup=keyboard)
    await state.set_state(ProfileStates.waiting_for_profile)

@dp.callback_query(lambda c: c.data == "find_match")
async def find_match(callback: CallbackQuery, state: FSMContext) -> None:
    user_id = callback.from_user.id
    profile = await get_user_profile(user_id)
    if not profile:
        await callback.answer("Сначала заполни анкету в MiniApp!", show_alert=True)
        return
    
    # Симуляция матча (в реальности — алгоритм из найденных проектов)
    match_text = (
        "🎉 Мы подобрали тебе компанию по вайбу!\n\n"
        "Ресторан: Итальянская кухня 'Bella Vista' (забронировано на 19:00).\n"
        "Темы для разговора: Путешествия, хобби, любимые книги.\n\n"
        "После ужина рекомендуем бар 'Cozy Corner' рядом."
    )
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Подтвердить встречу", callback_data="confirm_meetup")],
        [InlineKeyboardButton(text="Отменить", callback_data="cancel")]
    ])
    await callback.message.answer(match_text, reply_markup=keyboard)

@dp.callback_query(lambda c: c.data == "confirm_meetup")
async def confirm_meetup(callback: CallbackQuery) -> None:
    await callback.answer("Встреча подтверждена! Ждём тебя в ресторане 💛", show_alert=True)

@dp.callback_query(lambda c: c.data == "cancel")
async def cancel_meetup(callback: CallbackQuery) -> None:
    await callback.answer("Встреча отменена. Попробуй найти другую компанию позже.", show_alert=True)

# Заглушка для сохранения профиля из MiniApp (предполагаем webhook или API)
@dp.message(Command("save_profile"))
async def save_profile(message: Message) -> None:
    # В реальности данные приходят из MiniApp (через API)
    user_id = message.from_user.id
    profile_data = {"name": "Пример", "age": 25, "interests": "ужины"}  # Симуляция
    await save_user_profile(user_id, profile_data)
    await message.answer("Профиль сохранён! Теперь можешь искать компанию.")

async def main() -> None:
    await init_db()  # Инициализация БД
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())