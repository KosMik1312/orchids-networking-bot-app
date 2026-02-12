import asyncio
import sys
import argparse
from sqlalchemy import text

from db.session import init_db, get_session_factory, engine
from db.models import Base, User
from db.repository import UserRepo
from logger import get_db_logger

logger = get_db_logger()

async def recreate_db():
    """Пересоздает базу данных: удаляет все таблицы и создает заново."""
    print("⚠️  ВНИМАНИЕ: Все данные будут удалены! Вы уверены? (y/n)")
    choice = input().lower()
    if choice != 'y':
        print("❌ Отменено.")
        return

    logger.info("🗑️ Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    logger.info("✅ All tables dropped.")

    logger.info("🔄 Recreating tables...")
    await init_db()
    logger.info("✅ Database recreated successfully.")


async def add_admin(user_id: int):
    """Добавляет права администратора пользователю."""
    async_session = get_session_factory()
    async with async_session() as session:
        repo = UserRepo(session)
        # Сначала пробуем получить или создать пользователя (если его нет в БД)
        user = await repo.get_or_create_user(user_id)
        
        # ✅ ИСПРАВЛЕНИЕ: set_user_admin уже делает commit внутри
        success = await repo.set_user_admin(user_id, True)
        
        if success:
            print(f"✅ Пользователь {user_id} теперь администратор.")
            logger.info(f"User {user_id} promoted to admin via CLI.")
        else:
            print(f"❌ Не удалось найти пользователя {user_id}.")


async def main():
    parser = argparse.ArgumentParser(description="Управление базой данных Bot")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # recreate
    subparsers.add_parser("recreate", help="Пересоздать базу данных (УДАЛИТ ВСЕ ДАННЫЕ)")

    # add_admin
    parser_admin = subparsers.add_parser("add_admin", help="Добавить администратора")
    parser_admin.add_argument("user_id", type=int, help="Telegram ID пользователя")

    args = parser.parse_args()

    try:
        if args.command == "recreate":
            await recreate_db()
        elif args.command == "add_admin":
            await add_admin(args.user_id)
    except Exception as e:
        logger.error(f"Error executing command {args.command}: {e}")
        print(f"❌ Ошибка: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
