import aiosqlite

async def init_db():
    async with aiosqlite.connect("allora.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                name TEXT,
                age INTEGER,
                interests TEXT
            )
        """)
        await db.commit()

async def save_user_profile(user_id: int, profile: dict):
    async with aiosqlite.connect("allora.db") as db:
        await db.execute(
            "INSERT OR REPLACE INTO users (user_id, name, age, interests) VALUES (?, ?, ?, ?)",
            (user_id, profile["name"], profile["age"], profile["interests"])
        )
        await db.commit()

async def get_user_profile(user_id: int):
    async with aiosqlite.connect("allora.db") as db:
        cursor = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        return await cursor.fetchone()