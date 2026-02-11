import subprocess
import sys
import os
import signal
import time

# Переходим в папку bot (если запущено не из неё)
if os.path.dirname(__file__):
    os.chdir(os.path.dirname(__file__))

# Список запущенных процессов
processes = []

def signal_handler(sig, frame):
    """Обработка сигналов завершения"""
    print("\n⏹️  Остановка сервисов...")
    for process in processes:
        try:
            process.terminate()
        except:
            pass
    
    # Ждём завершения
    for process in processes:
        try:
            process.wait(timeout=5)
        except:
            process.kill()
    
    print("✅ Все сервисы остановлены")
    sys.exit(0)

def run_bot():
    """Запуск Telegram бота"""
    print("🤖 Запускаю Telegram бота...")
    process = subprocess.Popen(
        [sys.executable, "bot.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(process)
    
    # Читаем вывод в отдельном потоке
    for line in iter(process.stdout.readline, ''):
        if line:
            print(f"[BOT] {line.rstrip()}")
    
    return process

def run_api():
    """Запуск FastAPI сервера"""
    print("🚀 Запускаю FastAPI сервер...")
    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api_server:app", 
         "--host", "0.0.0.0", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    processes.append(process)
    
    # Читаем вывод в отдельном потоке
    for line in iter(process.stdout.readline, ''):
        if line:
            print(f"[API] {line.rstrip()}")
    
    return process

def main():
    print("🌸 Запуск Orchids Networking Bot + API Server")
    print("=" * 50)
    print(f"📁 Рабочая папка: {os.getcwd()}")
    print()
    
    # Обработка сигналов
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Запускаем API в отдельном потоке
        api_process = run_api()
        
        # Даём API время на запуск
        time.sleep(2)
        
        # Запускаем бот
        bot_process = run_bot()
        
        # Ждём завершения любого из процессов
        for process in processes:
            process.wait()
    
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()