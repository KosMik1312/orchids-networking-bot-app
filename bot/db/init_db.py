"""
Скрипт для инициализации базы данных.
Работает как с SQLite, так и с PostgreSQL.

Использование:
    python -m db.init_db
    или
    python init_db.py (если запускать из папки bot/)
"""

import asyncio
import sys
import os

# Add bot directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.session import init_db, engine, DATABASE_URL


async def main():
    """Главная функция инициализации"""
    print("\n" + "="*70)
    print("         🚀 DATABASE INITIALIZATION SCRIPT")
    print("="*70)
    
    print(f"\n[INFO] Database URL: {DATABASE_URL}")
    print(f"[INFO] Starting initialization...\n")
    
    try:
        # Инициализируем БД
        await init_db()
        
        print("\n[SUCCESS] ✅ Database initialized successfully!")
        print("[INFO] All tables created based on ORM models")
        
    except Exception as e:
        print(f"\n[ERROR] ❌ Failed to initialize database:")
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Закрываем все соединения
        await engine.dispose()
        print("\n[INFO] Database engine closed\n")


if __name__ == "__main__":
    asyncio.run(main())
