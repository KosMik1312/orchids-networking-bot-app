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
