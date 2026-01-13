import asyncio
import sys
import os

# Переходим в папку bot
os.chdir(os.path.join(os.path.dirname(__file__)))

async def run_bot():
    """Запуск Telegram бота"""
    print("🤖 Запускаю Telegram бота...")
    process = await asyncio.create_subprocess_exec(
        sys.executable, "bot.py",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )
    
    # Читаем вывод
    while True:
        line = await process.stdout.readline()
        if not line:
            break
        print(f"[BOT] {line.decode().strip()}")
    
    await process.wait()
    return process

async def run_api():
    """Запуск FastAPI сервера"""
    print("🚀 Запускаю FastAPI сервер...")
    process = await asyncio.create_subprocess_exec(
        sys.executable, "-m", "uvicorn", "api_server:app", 
        "--host", "0.0.0.0", "--port", "8000",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )
    
    # Читаем вывод
    while True:
        line = await process.stdout.readline()
        if not line:
            break
        print(f"[API] {line.decode().strip()}")
    
    await process.wait()
    return process

async def main():
    print("🌸 Запуск Orchids Networking Bot + API Server")
    print("=" * 50)
    print(f"📁 Рабочая папка: {os.getcwd()}")
    
    try:
        # Запускаем оба процесса параллельно
        await asyncio.gather(
            run_bot(),
            run_api()
        )
    except KeyboardInterrupt:
        print("\n⏹️  Остановка сервисов...")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    print("✅ Все сервисы остановлены")

if __name__ == "__main__":
    asyncio.run(main())