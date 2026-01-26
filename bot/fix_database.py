#!/usr/bin/env python3
"""
Скрипт для исправления проблем в базе данных allora.db.
Исправляет NULL значения в полях is_active и current_bookings.

Использование:
    python fix_database.py
"""

import sqlite3
import os
from config import DATABASE_NAME

def fix_database():
    """Исправляет базу данных"""
    db_path = os.path.abspath(DATABASE_NAME)
    
    if not os.path.exists(db_path):
        print(f"Ошибка: БД не найдена по пути {db_path}")
        return False
    
    print(f"Подключаюсь к БД: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Исправляем NULL значения в is_active
        cursor.execute("UPDATE dinner_slots SET is_active = 1 WHERE is_active IS NULL")
        fixed_is_active = cursor.rowcount
        
        # 2. Исправляем NULL значения в current_bookings
        cursor.execute("UPDATE dinner_slots SET current_bookings = 0 WHERE current_bookings IS NULL")
        fixed_current_bookings = cursor.rowcount
        
        conn.commit()
        
        print(f"✓ Исправлены слоты с is_active = NULL: {fixed_is_active}")
        print(f"✓ Исправлены слоты с current_bookings = NULL: {fixed_current_bookings}")
        
        # Показываем итоговый статус
        cursor.execute("SELECT COUNT(*) FROM dinner_slots WHERE is_active IS NULL OR current_bookings IS NULL")
        remaining = cursor.fetchone()[0]
        
        if remaining == 0:
            print("\n✓ ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ!")
            print("\nСлоты в БД:")
            cursor.execute("SELECT id, date, time, restaurant, current_bookings, max_people, is_active FROM dinner_slots ORDER BY id")
            for row in cursor.fetchall():
                status = "Активен" if row[6] else "Неактивен"
                print(f"  ID {row[0]}: {row[1]} {row[2]} | {row[3]} | {row[4]}/{row[5]} чел. | {status}")
            return True
        else:
            print(f"\n⚠ Остаётся проблемных слотов: {remaining}")
            return False
            
    except Exception as e:
        print(f"✗ Ошибка: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = fix_database()
    exit(0 if success else 1)
