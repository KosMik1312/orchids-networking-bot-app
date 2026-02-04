from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.exceptions import TelegramBadRequest
from datetime import datetime

# Импортируем вспомогательные функции из database_helpers для работы с БД
from database_helpers import (
    create_slot,
    get_all_slots,
    get_users_count,
    get_active_slots_count,
    get_total_bookings_count
)
from menu_setup import set_bot_commands

# Роутер для админских команд
admin_router = Router()

# Состояния для создания слотов
class SlotStates(StatesGroup):
    waiting_for_date = State()
    waiting_for_time = State()
    waiting_for_city = State()
    waiting_for_restaurant = State()
    waiting_for_max_people = State()

@admin_router.message(Command("admin"))
async def admin_panel(message: Message, is_admin: bool) -> None:
    """Главная панель администратора"""
    if not is_admin:
        return  # Middleware уже отправило сообщение об ошибке
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📅 Создать слот ужина", callback_data="create_slot")],
        [InlineKeyboardButton(text="📋 Управление слотами", callback_data="manage_slots")],
        [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton(text="📢 Рассылка", callback_data="broadcast")],
        [InlineKeyboardButton(text="🔄 Переустановить команды", callback_data="reset_commands")]
    ])
    
    await message.answer(
        "🔧 <b>Панель администратора Allora</b>\n\n"
        "Выберите действие:",
        reply_markup=keyboard
    )

@admin_router.callback_query(lambda c: c.data == "reset_commands")
async def reset_commands(callback: CallbackQuery, is_admin: bool) -> None:
    """Переустановка команд бота"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    try:
        await set_bot_commands(callback.bot)
        await callback.answer("✅ Команды переустановлены", show_alert=True)
    except Exception as e:
        await callback.answer(f"❌ Ошибка: {e}", show_alert=True)

@admin_router.callback_query(lambda c: c.data == "create_slot")
async def create_slot_start(callback: CallbackQuery, state: FSMContext, is_admin: bool) -> None:
    """Начало создания нового слота ужина"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    await callback.message.answer(
        "📅 <b>Создание нового слота ужина</b>\n\n"
        "Введите дату ужина в формате ДД.ММ.ГГГГ\n"
        "Например: 15.01.2025"
    )
    await state.set_state(SlotStates.waiting_for_date)
    await callback.answer()

@admin_router.message(SlotStates.waiting_for_date)
async def process_date(message: Message, state: FSMContext) -> None:
    """Обработка даты ужина"""
    try:
        datetime.strptime(message.text, "%d.%m.%Y")
        await state.update_data(date=message.text)
        
        await message.answer(
            "🕐 Введите время ужина в формате ЧЧ:ММ\n"
            "Например: 19:00"
        )
        await state.set_state(SlotStates.waiting_for_time)
    except ValueError:
        await message.answer(
            "❌ Неверный формат даты. Используйте ДД.ММ.ГГГГ\n"
            "Например: 15.01.2025"
        )

@admin_router.message(SlotStates.waiting_for_time)
async def process_time(message: Message, state: FSMContext) -> None:
    """Обработка времени ужина"""
    try:
        datetime.strptime(message.text, "%H:%M")
        await state.update_data(time=message.text)
        
        await message.answer(
            "🏙️ Введите город проведения ужина\n"
            "Например: Москва"
        )
        await state.set_state(SlotStates.waiting_for_city)
    except ValueError:
        await message.answer(
            "❌ Неверный формат времени. Используйте ЧЧ:ММ\n"
            "Например: 19:00"
        )

@admin_router.message(SlotStates.waiting_for_city)
async def process_city(message: Message, state: FSMContext) -> None:
    """Обработка города"""
    await state.update_data(city=message.text)
    
    await message.answer(
        "🍽️ Введите название ресторана\n"
        "Например: Bella Vista"
    )
    await state.set_state(SlotStates.waiting_for_restaurant)

@admin_router.message(SlotStates.waiting_for_restaurant)
async def process_restaurant(message: Message, state: FSMContext) -> None:
    """Обработка ресторана"""
    await state.update_data(restaurant=message.text)
    
    await message.answer(
        "👥 Введите максимальное количество участников\n"
        "Например: 8"
    )
    await state.set_state(SlotStates.waiting_for_max_people)

@admin_router.message(SlotStates.waiting_for_max_people)
async def process_max_people(message: Message, state: FSMContext) -> None:
    """Обработка количества участников и сохранение слота"""
    try:
        max_people = int(message.text)
        data = await state.get_data()
        
        # Используем нашу централизованную функцию для создания слота
        await create_slot(
            date=data['date'],
            time=data['time'],
            city=data['city'],
            restaurant=data['restaurant'],
            max_people=max_people
        )
        
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="➕ Создать ещё слот", callback_data="create_slot")],
            [InlineKeyboardButton(text="🏠 Главное меню", callback_data="admin_menu")]
        ])
        
        await message.answer(
            "✅ <b>Слот ужина успешно создан!</b>\n\n"
            f"📅 Дата: {data['date']}\n"
            f"🕐 Время: {data['time']}\n"
            f"🏙️ Город: {data['city']}\n"
            f"🍽️ Ресторан: {data['restaurant']}\n"
            f"👥 Макс. участников: {max_people}",
            reply_markup=keyboard
        )
        
        await state.clear()
        
    except ValueError:
        await message.answer(
            "❌ Введите корректное число участников\n"
            "Например: 8"
        )
    except Exception as e:
        await message.answer(f"❌ Произошла ошибка при создании слота: {e}")
        await state.clear()

@admin_router.callback_query(lambda c: c.data == "manage_slots")
async def manage_slots(callback: CallbackQuery, is_admin: bool) -> None:
    """Управление существующими слотами"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return

    slots = await get_all_slots()
    
    if not slots:
        await callback.message.edit_text("📋 Слоты ужинов пока не созданы.")
        await callback.answer()
        return
    
    text = "📋 <b>Управление слотами ужинов</b>\n\n"
    for slot in slots:
        status = "🟢 Активен" if slot['is_active'] else "🔴 Неактивен"
        text += f"🆔 {slot['id']} | {slot['date']} {slot['time']} | {slot['city']}\n"
        text += f"🍽️ {slot['restaurant']} | {slot['current_bookings']}/{slot['max_people']} чел. | {status}\n\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Обновить", callback_data="manage_slots")],
        [InlineKeyboardButton(text="🏠 Главное меню", callback_data="admin_menu")]
    ])
    
    try:
        await callback.message.edit_text(text, reply_markup=keyboard)
    except TelegramBadRequest as e:
        if "message is not modified" in str(e):
            pass  # Игнорируем, если сообщение не изменилось
        else:
            raise
    await callback.answer()

@admin_router.callback_query(lambda c: c.data == "admin_stats")
async def admin_stats(callback: CallbackQuery, is_admin: bool) -> None:
    """Статистика для администратора"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    # Получаем статистику через наши новые функции
    total_users = await get_users_count()
    active_slots = await get_active_slots_count()
    total_bookings = await get_total_bookings_count()
    
    text = (
        "📊 <b>Статистика Allora</b>\n\n"
        f"👥 Всего пользователей: {total_users}\n"
        f"📅 Активных слотов: {active_slots}\n"
        f"🎫 Всего бронирований: {total_bookings}\n"
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Обновить", callback_data="admin_stats")],
        [InlineKeyboardButton(text="🏠 Главное меню", callback_data="admin_menu")]
    ])
    
    try:
        await callback.message.edit_text(text, reply_markup=keyboard)
    except TelegramBadRequest as e:
        if "message is not modified" in str(e):
            pass
        else:
            raise
    await callback.answer()

@admin_router.callback_query(lambda c: c.data == "broadcast")
async def broadcast_menu(callback: CallbackQuery, is_admin: bool) -> None:
    """Меню рассылки"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    await callback.message.edit_text(
        "📢 <b>Рассылка сообщений</b>\n\n"
        "Функция рассылки будет добавлена в следующих обновлениях."
    )
    await callback.answer()

@admin_router.callback_query(lambda c: c.data == "admin_menu")
async def back_to_admin_menu(callback: CallbackQuery, is_admin: bool) -> None:
    """Возврат в главное меню админа"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📅 Создать слот ужина", callback_data="create_slot")],
        [InlineKeyboardButton(text="📋 Управление слотами", callback_data="manage_slots")],
        [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton(text="📢 Рассылка", callback_data="broadcast")],
        [InlineKeyboardButton(text="🔄 Переустановить команды", callback_data="reset_commands")]
    ])
    
    await callback.message.edit_text(
        "🔧 <b>Панель администратора Allora</b>\n\n"
        "Выберите действие:",
        reply_markup=keyboard
    )
    await callback.answer()