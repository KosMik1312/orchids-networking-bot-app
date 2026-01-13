import aiosqlite
from config import DATABASE_NAME

async def init_db():
    """Инициализация базы данных с созданием всех необходимых таблиц"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        # Таблица пользователей
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                name TEXT,
                age INTEGER,
                interests TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Таблица слотов ужинов
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
        
        # Таблица бронирований
        await db.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                slot_id INTEGER NOT NULL,
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                FOREIGN KEY (slot_id) REFERENCES dinner_slots (id)
            )
        """)
        
        await db.commit()

async def save_user_profile(user_id: int, profile: dict):
    """Сохранение профиля пользователя"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        await db.execute(
            "INSERT OR REPLACE INTO users (user_id, name, age, interests) VALUES (?, ?, ?, ?)",
            (user_id, profile["name"], profile["age"], profile["interests"])
        )
        await db.commit()

async def get_user_profile(user_id: int):
    """Получение профиля пользователя"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        return await cursor.fetchone()

async def create_slot(date: str, time: str, city: str, restaurant: str, max_people: int):
    """Создание нового слота ужина"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        await db.execute(
            "INSERT INTO dinner_slots (date, time, city, restaurant, max_people) VALUES (?, ?, ?, ?, ?)",
            (date, time, city, restaurant, max_people)
        )
        await db.commit()

async def get_all_slots():
    """Получение всех слотов ужинов"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM dinner_slots ORDER BY date, time")
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def get_users_count():
    """Получение общего количества пользователей"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM users")
        result = await cursor.fetchone()
        return result[0] if result else 0

async def get_active_slots_count():
    """Получение количества активных слотов"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM dinner_slots WHERE is_active = 1")
        result = await cursor.fetchone()
        return result[0] if result else 0

async def get_total_bookings_count():
    """Получение общего количества бронирований"""
    async with aiosqlite.connect(DATABASE_NAME) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM bookings WHERE status = 'active'")
        result = await cursor.fetchone()
        return result[0] if result else 0
