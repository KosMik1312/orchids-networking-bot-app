#!/usr/bin/env python3
"""
Проверка зависимостей проекта
"""

def check_dependencies():
    print("🔍 Проверяю зависимости...")
    
    required_packages = [
        'aiogram',
        'aiosqlite', 
        'fastapi',
        'uvicorn',
        'pydantic'
    ]
    
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - НЕ УСТАНОВЛЕН")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Не хватает пакетов: {', '.join(missing)}")
        print("Установите их командой:")
        print("pip install " + " ".join(missing))
        return False
    else:
        print("\n✅ Все зависимости установлены!")
        return True

if __name__ == "__main__":
    check_dependencies()