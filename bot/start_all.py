import asyncio
import sys
import os

# Переходим в папку bot (если запущено не из неё)
if os.path.dirname(__file__):
    os.chdir(os.path.dirname(__file__))

async def run_tunnel():
    """Запуск localtunnel"""
    print("🌐 Запускаю localtunnel...")
    try:
        # Пробуем разные варианты команды
        commands = [
            ["lt", "--port", "8000", "--subdomain", "orchids-api"],
            ["npx", "localtunnel", "--port", "8000", "--subdomain", "orchids-api"],
            ["node", "-e", "require('localtunnel')({port: 8000, subdomain: 'orchids-api'}).then(tunnel => console.log('your url is:', tunnel.url))"]
        ]
        
        for cmd in commands:
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT
                )
                break
            except FileNotFoundError:
                continue
        else:
            print("❌ localtunnel не найден. Запустите вручную: lt --port 8000 --subdomain orchids-api")
            return None
        
        # Читаем вывод
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            output = line.decode().strip()
            if "your url is:" in output:
                print(f"🌐 [TUNNEL] {output}")
            else:
                print(f"[TUNNEL] {output}")
        
        await process.wait()
        return process
    except Exception as e:
        print(f"❌ Ошибка запуска tunnel: {e}")
        print("📝 Запустите вручную в отдельном терминале: lt --port 8000 --subdomain orchids-api")
        return None

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
    print("📝 Для туннеля запустите отдельно: lt --port 8000 --subdomain orchids-api")
    print("🌐 Тогда URL будет: https://orchids-api.loca.lt")
    print()
    
    try:
        # Запускаем только бот и API
        await asyncio.gather(
            run_api(),
            run_bot()
        )
    except KeyboardInterrupt:
        print("\n⏹️  Остановка сервисов...")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
    
    print("✅ Все сервисы остановлены")

if __name__ == "__main__":
    # Для Python 3.6 совместимость
    try:
        asyncio.run(main())
    except AttributeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
        loop.close()