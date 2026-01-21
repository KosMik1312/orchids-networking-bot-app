import aiosqlite
import os
from config import DATABASE_NAME


async def init_db():
    """Инициализация базы данных с созданием всех необходимых таблиц"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        # Таблица пользователей
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                name TEXT,
                age INTEGER,
                gender TEXT,
                relationship_status TEXT,
                children TEXT,
                occupation TEXT,
                goal TEXT,
                interests TEXT,
                comfort_level INTEGER,
                social_frequency INTEGER,
                communication_format TEXT,
                evening_scenario TEXT,
                telegram TEXT,
                instagram TEXT,
                photo TEXT,
                about_me TEXT,
                city TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Таблица слотов ужинов
        await db.execute(
            """
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
            """
        )

        # Таблица бронирований
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                slot_id INTEGER NOT NULL,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                FOREIGN KEY (slot_id) REFERENCES dinner_slots (id)
            )
            """
        )

        await db.commit()


async def save_user_profile(user_id: int, profile_update: dict):
    """Сохраняет или обновляет профиль пользователя, объединяя новые данные с существующими."""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row

        # 1. Получаем существующий профиль
        cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        existing_profile_row = await cursor.fetchone()

        # Конвертируем строку в изменяемый словарь или создаем новый
        existing_profile = dict(existing_profile_row) if existing_profile_row else {}

        # 2. Объединяем новые данные с существующими
        # Удаляем None значения из profile_update, чтобы не перезаписывать ими существующие данные
        updated_data = {k: v for k, v in profile_update.items() if v is not None}
        merged_profile = {**existing_profile, **updated_data}

        # 3. Используем INSERT OR REPLACE с полным, объединенным профилем
        await db.execute(
            """
            INSERT OR REPLACE INTO users (
                user_id, name, age, gender, relationship_status, children,
                occupation, goal, interests, comfort_level, social_frequency,
                communication_format, evening_scenario, telegram, instagram,
                photo, about_me, city
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                merged_profile.get("name"),
                merged_profile.get("age"),
                merged_profile.get("gender"),
                merged_profile.get("relationship_status"),
                merged_profile.get("children"),
                merged_profile.get("occupation"),
                merged_profile.get("goal"),
                merged_profile.get("interests"),
                merged_profile.get("comfort_level"),
                merged_profile.get("social_frequency"),
                merged_profile.get("communication_format"),
                merged_profile.get("evening_scenario"),
                merged_profile.get("telegram"),
                merged_profile.get("instagram"),
                merged_profile.get("photo"),
                merged_profile.get("about_me"),
                merged_profile.get("city"),
            ),
        )
        await db.commit()


async def get_user_profile(user_id: int):
    """Получение профиля пользователя"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        return await cursor.fetchone()


async def create_slot(date: str, time: str, city: str, restaurant: str, max_people: int):
    """Создание нового слота ужина"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            "INSERT INTO dinner_slots (date, time, city, restaurant, max_people) VALUES (?, ?, ?, ?, ?)",
            (date, time, city, restaurant, max_people),
        )
        await db.commit()


async def get_all_slots():
    """Получение всех слотов ужинов"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM dinner_slots ORDER BY date, time")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_users_count():
    """Получение общего количества пользователей"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM users")
        result = await cursor.fetchone()
        return result[0] if result else 0


async def get_active_slots_count():
    """Получение количества активных слотов"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM dinner_slots WHERE is_active = 1")
        result = await cursor.fetchone()
        return result[0] if result else 0


async def get_total_bookings_count():
    """Получение общего количества бронирований"""
    db_path = os.path.abspath(DATABASE_NAME)
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM bookings WHERE status = 'active'")
        result = await cursor.fetchone()
        return result[0] if result else 0
