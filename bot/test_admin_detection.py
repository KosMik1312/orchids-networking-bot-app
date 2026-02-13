"""
Тест определения типа пользователя (админ vs обычный пользователь).
Проверяет корректность работы функции get_user_initial_screen.
"""

import asyncio
import sys
import os

# Добавляем путь к модулям бота
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database_helpers import get_user_initial_screen
from config import ADMIN_IDS


async def test_admin_detection():
    """Тест определения администратора"""
    print("🧪 Запуск теста определения типа пользователя...")
    print(f"📋 ADMIN_IDS из конфига: {ADMIN_IDS}")
    
    if not ADMIN_IDS:
        print("⚠️  ПРЕДУПРЕЖДЕНИЕ: ADMIN_IDS пуст! Добавьте admin ID в .env файл")
        print("   Пример: ADMIN_IDS=123456789,987654321")
        return False
    
    # Тест 1: Проверка администратора из конфига
    print("\n--- Тест 1: Администратор из ADMIN_IDS ---")
    admin_id = ADMIN_IDS[0]
    print(f"Проверка user_id={admin_id}...")
    screen = await get_user_initial_screen(admin_id)
    print(f"Результат: screen={screen}")
    
    if screen != 'admin':
        print(f"❌ ОШИБКА: Ожидался screen='admin', получен screen='{screen}'")
        return False
    print("✅ Админ определён корректно")
    
    # Тест 2: Проверка обычного пользователя (несуществующий)
    print("\n--- Тест 2: Обычный пользователь (несуществующий) ---")
    regular_user_id = 999999999
    print(f"Проверка user_id={regular_user_id}...")
    screen_regular = await get_user_initial_screen(regular_user_id)
    print(f"Результат: screen={screen_regular}")
    
    if screen_regular not in ['welcome', 'booking']:
        print(f"❌ ОШИБКА: Ожидался screen='welcome' или 'booking', получен screen='{screen_regular}'")
        return False
    print(f"✅ Обычный пользователь определён корректно (screen={screen_regular})")
    
    # Тест 3: Проверка пользователя с is_admin=True в БД
    print("\n--- Тест 3: Администратор из БД (is_admin=True) ---")
    
    from db.session import init_db, get_session_factory
    from db.repository import UserRepo
    
    await init_db()
    async_session = get_session_factory()
    
    async with async_session() as session:
        repo = UserRepo(session)
        
        # Создаём тестового пользователя с is_admin=True
        test_admin_id = 888888888
        print(f"Создание тестового админа user_id={test_admin_id}...")
        
        await repo.get_or_create_user(test_admin_id)
        await repo.set_user_admin(test_admin_id, is_admin=True)
        
        print(f"Проверка user_id={test_admin_id}...")
        screen_db_admin = await get_user_initial_screen(test_admin_id)
        print(f"Результат: screen={screen_db_admin}")
        
        if screen_db_admin != 'admin':
            print(f"❌ ОШИБКА: Админ из БД не определён! Ожидался 'admin', получен '{screen_db_admin}'")
            return False
        print("✅ Админ из БД определён корректно")
    
    return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_admin_detection())
        if result:
            print("\n✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ")
            sys.exit(0)
        else:
            print("\n❌ ТЕСТЫ ПРОВАЛЕНЫ")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ ОШИБКА ТЕСТА: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
