from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery, WebAppInfo
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.exceptions import TelegramBadRequest
from datetime import datetime
import logging

from database_helpers import (
    create_slot,
    get_all_slots,
    get_users_count,
    get_active_slots_count,
    get_total_bookings_count
)
from menu_setup import set_bot_commands
from config import MINIAPP_URL, ADMIN_IDS

logger = logging.getLogger(__name__)

admin_router = Router()


class SlotStates(StatesGroup):
    waiting_for_date = State()
    waiting_for_time = State()
    waiting_for_city = State()
    waiting_for_restaurant = State()
    waiting_for_max_people = State()


@admin_router.message(Command("admin"))
async def admin_panel(message: Message, is_admin: bool) -> None:
    """Открывает админ-панель в MiniApp.
    
    ✅ АРХИТЕКТУРА С INITDATA:
    - Telegram MiniApp автоматически передаёт initData (подписано Telegram)
    - Не нужно генерировать токены - инициализация встроена в WebApp API
    - Фронтенд использует initData для всех API запросов
    """
    user_id = message.from_user.id
    
    if not is_admin:
        logger.error(f"❌ User {user_id} tried /admin but is not admin. is_admin={is_admin}, ADMIN_IDS from config={ADMIN_IDS}")
        await message.answer(
            "❌ У вас нет прав администратора. Обратитесь к владельцу бота."
        )
        return

    logger.info(f"✅ User {user_id} opened admin panel. is_admin=True")

    if not MINIAPP_URL:
        await message.answer(
            "❌ MINIAPP_URL не настроен. Задайте его в .env файле."
        )
        return

    # initData передаётся автоматически в MiniApp API
    admin_url = MINIAPP_URL
    
    logger.info(f"🔒 Sending admin to {user_id}. MiniApp will authenticate via Telegram initData")

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🔧 Открыть панель администратора",
            web_app=WebAppInfo(url=admin_url)
        )],
    ])

    await message.answer(
        "🔧 <b>Панель администратора Allora</b>\n\n"
        "Нажмите кнопку ниже, чтобы открыть админ-панель:",
        reply_markup=keyboard
    )


@admin_router.callback_query(lambda c: c.data == "reset_commands")
async def reset_commands(callback: CallbackQuery, is_admin: bool) -> None:
    """Переустановка команд бота"""
    if not is_admin:
        await callback.answer("No access", show_alert=True)
        return
    try:
        await set_bot_commands(callback.bot)
        await callback.answer("Commands reset", show_alert=True)
    except Exception as e:
        await callback.answer(f"Error: {e}", show_alert=True)


@admin_router.callback_query(lambda c: c.data == "create_slot")
async def create_slot_start(callback: CallbackQuery, state: FSMContext, is_admin: bool) -> None:
    if not is_admin:
        await callback.answer("No access", show_alert=True)
        return
    await callback.message.answer(
        "Enter date (DD.MM.YYYY):"
    )
    await state.set_state(SlotStates.waiting_for_date)
    await callback.answer()


@admin_router.message(SlotStates.waiting_for_date)
async def process_date(message: Message, state: FSMContext) -> None:
    try:
        datetime.strptime(message.text, "%d.%m.%Y")
        await state.update_data(date=message.text)
        await message.answer("Enter time (HH:MM):")
        await state.set_state(SlotStates.waiting_for_time)
    except ValueError:
        await message.answer("Invalid date format. Use DD.MM.YYYY")


@admin_router.message(SlotStates.waiting_for_time)
async def process_time(message: Message, state: FSMContext) -> None:
    try:
        datetime.strptime(message.text, "%H:%M")
        await state.update_data(time=message.text)
        await message.answer("Enter city:")
        await state.set_state(SlotStates.waiting_for_city)
    except ValueError:
        await message.answer("Invalid time format. Use HH:MM")


@admin_router.message(SlotStates.waiting_for_city)
async def process_city(message: Message, state: FSMContext) -> None:
    await state.update_data(city=message.text)
    await message.answer("Enter restaurant name:")
    await state.set_state(SlotStates.waiting_for_restaurant)


@admin_router.message(SlotStates.waiting_for_restaurant)
async def process_restaurant(message: Message, state: FSMContext) -> None:
    await state.update_data(restaurant=message.text)
    await message.answer("Enter max people:")
    await state.set_state(SlotStates.waiting_for_max_people)


@admin_router.message(SlotStates.waiting_for_max_people)
async def process_max_people(message: Message, state: FSMContext) -> None:
    try:
        max_people = int(message.text)
        data = await state.get_data()
        await create_slot(
            date=data['date'],
            time=data['time'],
            city=data['city'],
            restaurant=data['restaurant'],
            max_people=max_people
        )
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Create another", callback_data="create_slot")],
        ])
        await message.answer(
            f"Slot created!\n"
            f"Date: {data['date']}\n"
            f"Time: {data['time']}\n"
            f"City: {data['city']}\n"
            f"Restaurant: {data['restaurant']}\n"
            f"Max people: {max_people}",
            reply_markup=keyboard
        )
        await state.clear()
    except ValueError:
        await message.answer("Enter a valid number")
    except Exception as e:
        await message.answer(f"Error: {e}")
        await state.clear()
