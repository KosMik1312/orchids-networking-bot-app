import subprocess
import sys
import os
import signal
import threading

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

def main():
    print("🌸 Запуск Antre Club Bot + API Server")
    print("=" * 50)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
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
