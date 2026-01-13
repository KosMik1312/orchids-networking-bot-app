from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from datetime import datetime
import aiosqlite
from config import DATABASE_NAME
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
        await message.answer("❌ У вас нет прав для выполнения этой команды.")
        return
    
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
async def reset_commands(callback, is_admin: bool) -> None:
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
async def create_slot_start(callback, state: FSMContext, is_admin: bool) -> None:
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

@admin_router.message(SlotStates.waiting_for_date)
async def process_date(message: Message, state: FSMContext) -> None:
    """Обработка даты ужина"""
    try:
        date_obj = datetime.strptime(message.text, "%d.%m.%Y")
        await state.update_data(date=message.text, date_obj=date_obj)
        
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
        time_obj = datetime.strptime(message.text, "%H:%M")
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
        
        # Сохраняем слот в базу данных
        async with aiosqlite.connect(DATABASE_NAME) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS dinner_slots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    city TEXT NOT NULL,
                    restaurant TEXT NOT NULL,
                    max_people INTEGER NOT NULL,
                    current_bookings INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1
                )
            """)
            
            await db.execute("""
                INSERT INTO dinner_slots (date, time, city, restaurant, max_people)
                VALUES (?, ?, ?, ?, ?)
            """, (data['date'], data['time'], data['city'], data['restaurant'], max_people))
            
            await db.commit()
        
        # Подтверждение создания
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

@admin_router.callback_query(lambda c: c.data == "manage_slots")
async def manage_slots(callback, is_admin: bool) -> None:
    """Управление существующими слотами"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    async with aiosqlite.connect(DATABASE_NAME) as db:
        cursor = await db.execute("""
            SELECT id, date, time, city, restaurant, current_bookings, max_people, is_active
            FROM dinner_slots 
            ORDER BY date, time
        """)
        slots = await cursor.fetchall()
    
    if not slots:
        await callback.message.answer("📋 Слоты ужинов пока не созданы.")
        return
    
    text = "📋 <b>Управление слотами ужинов</b>\n\n"
    for slot in slots:
        status = "🟢 Активен" if slot[7] else "🔴 Неактивен"
        text += f"🆔 {slot[0]} | {slot[1]} {slot[2]} | {slot[3]}\n"
        text += f"🍽️ {slot[4]} | {slot[5]}/{slot[6]} чел. | {status}\n\n"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Обновить", callback_data="manage_slots")],
        [InlineKeyboardButton(text="🏠 Главное меню", callback_data="admin_menu")]
    ])
    
    await callback.message.answer(text, reply_markup=keyboard)

@admin_router.callback_query(lambda c: c.data == "admin_stats")
async def admin_stats(callback, is_admin: bool) -> None:
    """Статистика для администратора"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    async with aiosqlite.connect(DATABASE_NAME) as db:
        # Общее количество пользователей
        cursor = await db.execute("SELECT COUNT(*) FROM users")
        total_users = (await cursor.fetchone())[0]
        
        # Количество активных слотов
        cursor = await db.execute("SELECT COUNT(*) FROM dinner_slots WHERE is_active = 1")
        active_slots = (await cursor.fetchone())[0] if cursor else 0
        
        # Общее количество бронирований
        cursor = await db.execute("SELECT SUM(current_bookings) FROM dinner_slots")
        total_bookings = (await cursor.fetchone())[0] or 0
    
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
    
    await callback.message.answer(text, reply_markup=keyboard)

@admin_router.callback_query(lambda c: c.data == "broadcast")
async def broadcast_menu(callback, is_admin: bool) -> None:
    """Меню рассылки"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    await callback.message.answer(
        "📢 <b>Рассылка сообщений</b>\n\n"
        "Функция рассылки будет добавлена в следующих обновлениях."
    )

@admin_router.callback_query(lambda c: c.data == "admin_menu")
async def back_to_admin_menu(callback, is_admin: bool) -> None:
    """Возврат в главное меню админа"""
    if not is_admin:
        await callback.answer("❌ Нет прав доступа", show_alert=True)
        return
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📅 Создать слот ужина", callback_data="create_slot")],
        [InlineKeyboardButton(text="📋 Управление слотами", callback_data="manage_slots")],
        [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton(text="📢 Рассылка", callback_data="broadcast")]
    ])
    
    await callback.message.answer(
        "🔧 <b>Панель администратора Allora</b>\n\n"
        "Выберите действие:",
        reply_markup=keyboard
    )