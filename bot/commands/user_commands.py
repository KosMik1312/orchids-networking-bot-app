from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from config import MINIAPP_URL
from auth_token import generate_user_token
from i18n import i18n  # Import i18n helper

# Роутер для пользовательских команд
user_router = Router()

@user_router.message(CommandStart())
async def start_command(message: Message, state: FSMContext) -> None:
    """Команда /start для всех пользователей"""
    # Получаем Telegram ID пользователя (это безопасно - данные от Telegram)
    user_id = message.from_user.id
    lang = message.from_user.language_code
    
    # Генерируем токен с Telegram ID
    token = generate_user_token(user_id)
    
    # Строим URL миниапп с токеном
    miniapp_url_with_token = f"{MINIAPP_URL}?token={token}"
    
    # URL канала пока хардкодим или берем из конфига/i18n, в i18n строках уже есть placeholder 'CHANNEL_ID' но мы его не заменяем пока
    # так как пользователь не дал ID.
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url_with_token))],
        [InlineKeyboardButton(text=i18n.get("btn_learn_more", lang), callback_data="learn_more")]
    ])
    await message.answer(i18n.get("welcome_text", lang), reply_markup=keyboard)

@user_router.callback_query(lambda c: c.data == "learn_more")
async def learn_more(callback) -> None:
    """Обработчик кнопки 'Узнать больше'"""
    # Получаем Telegram ID пользователя
    user_id = callback.from_user.id
    lang = callback.from_user.language_code
    
    # Генерируем токен с Telegram ID
    token = generate_user_token(user_id)
    
    # Строим URL миниапп с токеном
    miniapp_url_with_token = f"{MINIAPP_URL}?token={token}"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url_with_token))]
    ])
    await callback.message.answer(i18n.get("learn_more_text", lang), reply_markup=keyboard)