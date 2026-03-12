import subprocess
import sys
import os
import signal
import threading
import asyncio

processes = []

def signal_handler(sig, frame):
    print("\n⏹️  Остановка сервисов...")
    for process in processes:
        try:
            process.terminate()
        except:
            pass
    sys.exit(0)

def stream_output(process, prefix):
    """Читает вывод процесса в отдельном потоке"""
    for line in iter(process.stdout.readline, ''):
        if line:
            print(f"[{prefix}] {line.rstrip()}", flush=True)

async def run_migrations():
    """
    Запускает все миграции БД перед стартом приложения.
    Safe: использует CREATE TABLE IF NOT EXISTS
    Одноразово: после успеха создает флаг-файл .migrations_done
    """
    # Флаг-файл для одноразового запуска миграций
    migrations_flag = ".migrations_done"
    
    # Если миграции уже были запущены - пропускаем
    if os.path.exists(migrations_flag):
        print("\n🔧 [MIGRATIONS] Миграции уже выполнены ранее. Пропускаем.")
        return True
    
    print("\n🔧 [MIGRATIONS] Запуск миграций БД (первый запуск)...")
    
    try:
        from db.session import init_db, get_async_engine, AsyncSessionLocal
        from sqlalchemy import text
        
        # Инициализируем БД
        await init_db()
        print("[MIGRATIONS] ✅ База данных инициализирована")
        
        # SQL для создания таблиц акций
        migration_sql = """
        -- Таблица акций/предложений
        CREATE TABLE IF NOT EXISTS promotions (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            description TEXT NOT NULL,
            target_audience VARCHAR,
            price INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            validity_days INTEGER NOT NULL DEFAULT 30,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS ix_promotions_is_active ON promotions (is_active);

        -- Таблица покупок акций
        CREATE TABLE IF NOT EXISTS promotion_purchases (
            id SERIAL PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
            payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
            status VARCHAR DEFAULT 'pending',
            purchased_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP,
            visits_remaining INTEGER
        );

        CREATE INDEX IF NOT EXISTS ix_promotion_purchases_user_id ON promotion_purchases (user_id);
        CREATE INDEX IF NOT EXISTS ix_promotion_purchases_promotion_id ON promotion_purchases (promotion_id);
        CREATE INDEX IF NOT EXISTS ix_promotion_purchases_status ON promotion_purchases (status);
        CREATE INDEX IF NOT EXISTS ix_promotion_purchases_user_status ON promotion_purchases (user_id, status);
        """
        
        # Выполняем миграцию
        engine = get_async_engine()
        async with engine.begin() as conn:
            for statement in migration_sql.strip().split(";"):
                stmt = statement.strip()
                if stmt and not stmt.startswith("--"):
                    await conn.execute(text(stmt))
        
        print("[MIGRATIONS] ✅ Таблицы promotions созданы успешно")
        
        # Проверяем, что таблицы существуют
        async with AsyncSessionLocal() as session:
            result = await session.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promotions')"
            ))
            if result.scalar():
                print("[MIGRATIONS] ✅ Миграции завершены успешно!")
                # Создаем флаг-файл для пропуска миграций при следующих запусках
                try:
                    with open(migrations_flag, "w") as f:
                        f.write("Миграции успешно выполнены в первый запуск\n")
                    print("[MIGRATIONS] ✅ Флаг миграций создан - они больше не будут запускаться")
                except Exception as e:
                    print(f"[MIGRATIONS] ⚠️ Не удалось создать флаг: {e}")
                return True
            else:
                print("[MIGRATIONS] ❌ Таблица promotions не найдена после миграции")
                return False
    
    except Exception as e:
        print(f"[MIGRATIONS] ❌ ОШИБКА при запуске миграций: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🌸 Запуск Antre Club Bot + API Server")
    print("=" * 50)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Запускаем миграции БД перед стартом приложения
    print("\n📦 [STARTUP] Инициализация БД...")
    migration_success = asyncio.run(run_migrations())
    
    if not migration_success:
        print("\n❌ Миграции не прошли успешно. Приложение не запущено.")
        sys.exit(1)
    
    print("\n✅ [STARTUP] Все миграции завершены. Запускаем сервисы...\n")
    
    # Запуск API
    print("🚀 Запускаю FastAPI...")
    api_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api_server:app", 
         "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(api_process)
    
    # Запуск бота
    print("🤖 Запускаю Telegram бота...")
    bot_process = subprocess.Popen(
        [sys.executable, "bot.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(bot_process)
    
    # Потоки для вывода
    threading.Thread(target=stream_output, args=(api_process, "API"), daemon=True).start()
    threading.Thread(target=stream_output, args=(bot_process, "BOT"), daemon=True).start()
    
    # Ждём завершения
    for process in processes:
        process.wait()

if __name__ == "__main__":
    main()
