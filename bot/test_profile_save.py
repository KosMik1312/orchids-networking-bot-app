"""
Тест сохранения профиля пользователя в БД.
Проверяет корректность работы репозитория UserRepo.
"""

import asyncio
import sys
import os

# Добавляем путь к модулям бота
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.session import init_db, get_session_factory
from db.repository import UserRepo
from schemas import UserProfile


async def test_save_profile():
    """Тест сохранения профиля пользователя"""
    print("🧪 Запуск теста сохранения профиля...")
    
    await init_db()
    async_session = get_session_factory()
    
    async with async_session() as session:
        repo = UserRepo(session)
        
        # Тестовые данные
        test_user_id = 123456789
        test_data = UserProfile(
            name='Тест Пользователь',
            age=25,
            gender='male',
            telegram='@test_user',
            instagram='test_user_insta',
            occupation='Тестировщик',
            city='Москва',
            is_profile_completed=True
        )
        
        print(f"📝 Сохранение профиля для user_id={test_user_id}...")
        user = await repo.save_user_profile(test_user_id, test_data)
        
        print(f"✅ Профиль сохранён:")
        print(f"   - Имя: {user.name}")
        print(f"   - Возраст: {user.age}")
        print(f"   - Пол: {user.gender}")
        print(f"   - Telegram: {user.telegram}")
        print(f"   - Instagram: {user.instagram}")
        print(f"   - Город: {user.city}")
        print(f"   - Профиль завершён: {user.is_profile_completed}")
        
        # Проверяем чтение
        print(f"\n📖 Чтение профиля из БД...")
        user_check = await repo.get_user_profile(test_user_id)
        
        if not user_check:
            print("❌ ОШИБКА: Пользователь не найден при чтении!")
            return False
        
        # Проверка корректности данных
        assert user_check.name == 'Тест Пользователь', f"Неверное имя: {user_check.name}"
        assert user_check.age == 25, f"Неверный возраст: {user_check.age}"
        assert user_check.gender == 'male', f"Неверный пол: {user_check.gender}"
        assert user_check.telegram == '@test_user', f"Неверный Telegram: {user_check.telegram}"
        assert user_check.is_profile_completed == True, f"Неверный статус завершения: {user_check.is_profile_completed}"
        
        print("✅ Все проверки пройдены успешно!")
        print(f"\n🧹 Очистка: удаление тестового пользователя...")
        
        # Удаляем тестового пользователя (опционально)
        # from db.models import User
        # await session.delete(user)
        # await session.commit()
        
        return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_save_profile())
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
