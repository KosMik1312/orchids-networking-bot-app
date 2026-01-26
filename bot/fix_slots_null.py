#!/usr/bin/env python3
"""
Скрипт для исправления NULL значений в поле current_bookings таблицы dinner_slots.
Используется при обнаружении ошибки при загрузке слотов.
"""
import sqlite3
import os
from config import DATABASE_NAME


def fix_slots_null_values():
    """Обновляет NULL значения в current_bookings на 0"""
    db_path = os.path.abspath(DATABASE_NAME)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"[FIX_SLOTS] Подключение к БД: {db_path}")
        
        # Проверяем сколько слотов с NULL значениями
        cursor.execute("SELECT COUNT(*) FROM dinner_slots WHERE current_bookings IS NULL")
        null_count = cursor.fetchone()[0]
        print(f"[FIX_SLOTS] Найдено слотов с NULL в current_bookings: {null_count}")
        
        if null_count > 0:
            # Обновляем NULL на 0
            cursor.execute("UPDATE dinner_slots SET current_bookings = 0 WHERE current_bookings IS NULL")
            conn.commit()
            print(f"[FIX_SLOTS] ✅ Обновлено {cursor.rowcount} слотов")
        
        # Проверяем сколько слотов с NULL в is_active
        cursor.execute("SELECT COUNT(*) FROM dinner_slots WHERE is_active IS NULL")
        is_active_null = cursor.fetchone()[0]
        print(f"[FIX_SLOTS] Найдено слотов с NULL в is_active: {is_active_null}")
        
        if is_active_null > 0:
            cursor.execute("UPDATE dinner_slots SET is_active = 1 WHERE is_active IS NULL")
            conn.commit()
            print(f"[FIX_SLOTS] ✅ Обновлено {cursor.rowcount} слотов (is_active)")
        
        # Показываем все слоты
        cursor.execute("SELECT id, date, time, city, max_people, current_bookings, is_active FROM dinner_slots")
        slots = cursor.fetchall()
        print(f"\n[FIX_SLOTS] Все слоты после исправления:")
        for slot in slots:
            slot_id, date, time, city, max_people, current_bookings, is_active = slot
            print(f"  ID: {slot_id} | {date} {time} | {city} | {max_people} мест | Бронировано: {current_bookings} | Активен: {is_active}")
        
        cursor.close()
        conn.close()
        
        print("\n[FIX_SLOTS] ✅ Исправление завершено успешно!")
        return True
        
    except Exception as e:
        print(f"[FIX_SLOTS] ❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    import sys
    success = fix_slots_null_values()
    sys.exit(0 if success else 1)
