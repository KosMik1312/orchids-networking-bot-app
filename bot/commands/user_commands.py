import asyncio
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
    
    Может принимать аргументы deep link, например: /start payment_success_12345
    """
    user_id = message.from_user.id
    lang = message.from_user.language_code
    
    # Получаем аргументы команды /start (если есть)
    command_args = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else None
    
    base_miniapp_url = MINIAPP_URL
    
    if command_args and command_args.startswith("payment_"):
        # Если юзер вернулся с оплаты, формируем специальную кнопку для возврата в MiniApp с параметром
        # Telegram MiniApp получит этот параметр в window.Telegram.WebApp.initDataUnsafe.start_param
        miniapp_url_with_param = f"{base_miniapp_url}?startapp={command_args}"
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="✅ Подтвердить оплату", web_app=WebAppInfo(url=miniapp_url_with_param))]
        ])
        await message.answer(
            "⏳ Платёж обрабатывается...\n\nНажмите кнопку ниже, чтобы вернуться в приложение и получить подтверждение бронирования.",
            reply_markup=keyboard
        )
        return

    # Обычный старт
    miniapp_url = base_miniapp_url
    
    # Первое сообщение с двумя кнопками
    keyboard1 = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url))],
        [InlineKeyboardButton(text=i18n.get("btn_learn_more", lang), callback_data="learn_more")]
    ])
    await message.answer(i18n.get("welcome_text", lang), reply_markup=keyboard1)

    # Задержка 4 секунды перед вторым сообщением
    await asyncio.sleep(4)

    # Второе сообщение только с кнопкой "Начать"
    keyboard2 = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url))]
    ])
    await message.answer(i18n.get("welcome_text_2", lang), reply_markup=keyboard2)


@user_router.callback_query(lambda c: c.data == "learn_more")
async def learn_more(callback) -> None:
    """Обработчик кнопки 'Узнать больше' - показывает второе приветственное сообщение"""
    lang = callback.from_user.language_code

    # initData передаётся автоматически через WebApp API
    miniapp_url = MINIAPP_URL
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=i18n.get("btn_start", lang), web_app=WebAppInfo(url=miniapp_url))]
    ])
    await callback.message.answer(i18n.get("welcome_text_2", lang), reply_markup=keyboard)