#!/usr/bin/env python3
"""
Скрипт для отладки проблемы с бронированиями.
Проверяет все бронирования и их привязку к пользователям и слотам.
"""

import sqlite3
import json

db_path = "allora.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 60)
print("ОТЛАДКА БРОНИРОВАНИЙ")
print("=" * 60)

# 1. Слоты
print("\n1. СЛОТЫ В БД:")
cursor.execute("""
    SELECT id, date, time, restaurant, current_bookings, max_people, is_active 
    FROM dinner_slots 
    ORDER BY id
""")
for row in cursor.fetchall():
    status = "✓" if row[6] else "✗"
    print(f"  [ID {row[0]}] {row[1]} {row[2]} | {row[3]} | {row[4]}/{row[5]} [{status}]")

# 2. Бронирования
print("\n2. БРОНИРОВАНИЯ В БД:")
cursor.execute("""
    SELECT b.id, b.user_id, b.slot_id, b.status, b.booking_date, 
           s.date, s.time, s.restaurant
    FROM bookings b
    LEFT JOIN dinner_slots s ON b.slot_id = s.id
    ORDER BY b.id
""")
bookings = cursor.fetchall()
if not bookings:
    print("  (нет бронирований)")
else:
    for row in bookings:
        print(f"  [ID {row[0]}] user={row[1]}, slot={row[2]}, status={row[3]}")
        print(f"            -> {row[5]} {row[6]} | {row[7]} | date={row[4]}")

# 3. Статистика по пользователям
print("\n3. БРОНИРОВАНИЯ ПО ПОЛЬЗОВАТЕЛЯМ:")
cursor.execute("""
    SELECT user_id, COUNT(*) as count, GROUP_CONCAT(slot_id) as slots
    FROM bookings
    GROUP BY user_id
    ORDER BY user_id
""")
for row in cursor.fetchall():
    print(f"  Пользователь {row[0]}: {row[1]} бронирований (слоты: {row[2]})")

# 4. Статистика по слотам
print("\n4. БРОНИРОВАНИЯ ПО СЛОТАМ:")
cursor.execute("""
    SELECT slot_id, COUNT(*) as count, GROUP_CONCAT(user_id) as users
    FROM bookings
    GROUP BY slot_id
    ORDER BY slot_id
""")
for row in cursor.fetchall():
    print(f"  Слот {row[0]}: {row[1]} бронирований (пользователи: {row[2]})")

# 5. Проверка целостности (несуществующие слоты)
print("\n5. ПРОВЕРКА ЦЕЛОСТНОСТИ:")
cursor.execute("""
    SELECT COUNT(*) 
    FROM bookings b
    WHERE NOT EXISTS (SELECT 1 FROM dinner_slots s WHERE s.id = b.slot_id)
""")
orphaned = cursor.fetchone()[0]
if orphaned > 0:
    print(f"  ⚠ Найдено {orphaned} бронирований для несуществующих слотов")
else:
    print(f"  ✓ Все бронирования привязаны к существующим слотам")

# 6. Проверка статусов
print("\n6. СТАТУСЫ БРОНИРОВАНИЙ:")
cursor.execute("""
    SELECT status, COUNT(*) as count
    FROM bookings
    GROUP BY status
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()

print("\n" + "=" * 60)
print("Конец отладки")
print("=" * 60)
