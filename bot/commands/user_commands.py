from urllib.parse import urlencode

from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from config import MINIAPP_URL
from i18n import i18n

# Роутер для пользовательских команд
user_router = Router()


@user_router.message(CommandStart())
async def start_command(message: Message, state: FSMContext) -> None:
    """Команда /start для всех пользователей
    
    ✅ АРХИТЕКТУРА С INITDATA:
    - Telegram MiniApp автоматически передаёт initData (подписано Telegram)
    - Фронтенд отправляет initData в каждом запросе (безопасно и просто)
    - Бэкенд верифицирует подпись через SECRET_KEY (встроенная защита от Telegram)
    """
    user_id = message.from_user.id
    lang = message.from_user.language_code

    # Больше не нужны токены! Telegram MiniApp автоматически передаст initData
    miniapp_url = MINIAPP_URL
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url))],
        [InlineKeyboardButton(text=i18n.get("btn_learn_more", lang), callback_data="learn_more")]
    ])
    await message.answer(i18n.get("welcome_text", lang), reply_markup=keyboard)

@user_router.callback_query(lambda c: c.data == "learn_more")
async def learn_more(callback) -> None:
    """Обработчик кнопки 'Узнать больше'"""
    lang = callback.from_user.language_code

    # initData передаётся автоматически через WebApp API
    miniapp_url = MINIAPP_URL
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url))]
    ])
    await callback.message.answer(i18n.get("learn_more_text", lang), reply_markup=keyboard)