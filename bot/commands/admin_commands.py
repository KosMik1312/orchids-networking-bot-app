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
from i18n import i18n

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
    
    lang = message.from_user.language_code
    
    if not is_admin:
        logger.error(f"❌ User {user_id} tried /admin but is not admin. is_admin={is_admin}, ADMIN_IDS from config={ADMIN_IDS}")
        await message.answer(i18n.get("admin_no_access", lang))
        return

    logger.info(f"✅ User {user_id} opened admin panel. is_admin=True")

    if not MINIAPP_URL:
        await message.answer(i18n.get("admin_miniapp_not_set", lang))
        return

    # Дополнительно обновляем меню команд именно для этого админа, 
    # чтобы гарантировать наличие кнопки /admin в его интерфейсе
    try:
        await set_bot_commands(message.bot)
    except Exception as e:
        logger.warning(f"Failed to refresh commands for admin {user_id}: {e}")

    admin_url = f"{MINIAPP_URL}?mode=admin"
    logger.info(f"🔒 Sending admin to {user_id}. MiniApp will authenticate via Telegram initData")

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text=i18n.get("admin_open_btn", lang),
            web_app=WebAppInfo(url=admin_url)
        )],
    ])

    await message.answer(
        f"{i18n.get('admin_panel_title', lang)}\n\n"
        f"{i18n.get('admin_panel_prompt', lang)}",
        reply_markup=keyboard
    )


@admin_router.callback_query(lambda c: c.data == "reset_commands")
async def reset_commands(callback: CallbackQuery, is_admin: bool) -> None:
    """Переустановка команд бота"""
    lang = callback.from_user.language_code
    if not is_admin:
        await callback.answer(i18n.get("admin_no_access_short", lang), show_alert=True)
        return
    try:
        await set_bot_commands(callback.bot)
        await callback.answer(i18n.get("admin_commands_reset", lang), show_alert=True)
    except Exception as e:
        await callback.answer(i18n.get("admin_error", lang, error=str(e)), show_alert=True)


@admin_router.callback_query(lambda c: c.data == "create_slot")
async def create_slot_start(callback: CallbackQuery, state: FSMContext, is_admin: bool) -> None:
    lang = callback.from_user.language_code
    if not is_admin:
        await callback.answer(i18n.get("admin_no_access_short", lang), show_alert=True)
        return
    await callback.message.answer(i18n.get("admin_enter_date", lang))
    await state.set_state(SlotStates.waiting_for_date)
    await callback.answer()


@admin_router.message(SlotStates.waiting_for_date)
async def process_date(message: Message, state: FSMContext) -> None:
    lang = message.from_user.language_code
    try:
        datetime.strptime(message.text, "%d.%m.%Y")
        await state.update_data(date=message.text)
        await message.answer(i18n.get("admin_enter_time", lang))
        await state.set_state(SlotStates.waiting_for_time)
    except ValueError:
        await message.answer(i18n.get("admin_invalid_date", lang))


@admin_router.message(SlotStates.waiting_for_time)
async def process_time(message: Message, state: FSMContext) -> None:
    lang = message.from_user.language_code
    try:
        datetime.strptime(message.text, "%H:%M")
        await state.update_data(time=message.text)
        await message.answer(i18n.get("admin_enter_city", lang))
        await state.set_state(SlotStates.waiting_for_city)
    except ValueError:
        await message.answer(i18n.get("admin_invalid_time", lang))


@admin_router.message(SlotStates.waiting_for_city)
async def process_city(message: Message, state: FSMContext) -> None:
    lang = message.from_user.language_code
    await state.update_data(city=message.text)
    await message.answer(i18n.get("admin_enter_restaurant", lang))
    await state.set_state(SlotStates.waiting_for_restaurant)


@admin_router.message(SlotStates.waiting_for_restaurant)
async def process_restaurant(message: Message, state: FSMContext) -> None:
    lang = message.from_user.language_code
    await state.update_data(restaurant=message.text)
    await message.answer(i18n.get("admin_enter_max_people", lang))
    await state.set_state(SlotStates.waiting_for_max_people)


@admin_router.message(SlotStates.waiting_for_max_people)
async def process_max_people(message: Message, state: FSMContext) -> None:
    lang = message.from_user.language_code
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
            [InlineKeyboardButton(text=i18n.get("admin_create_another", lang), callback_data="create_slot")],
        ])
        
        slot_info = (
            f"<b>{i18n.get('admin_slot_created', lang)}</b>\n\n"
            f"📅 {i18n.get('admin_slot_date', lang)}: {data['date']}\n"
            f"⏰ {i18n.get('admin_slot_time', lang)}: {data['time']}\n"
            f"📍 {i18n.get('admin_slot_city', lang)}: {data['city']}\n"
            f"🍴 {i18n.get('admin_slot_restaurant', lang)}: {data['restaurant']}\n"
            f"👥 {i18n.get('admin_slot_max_people', lang)}: {max_people}"
        )
        
        await message.answer(slot_info, reply_markup=keyboard)
        await state.clear()
    except ValueError:
        await message.answer(i18n.get("admin_invalid_number", lang))
    except Exception as e:
        await message.answer(i18n.get("admin_error", lang, error=str(e)))
        await state.clear()
