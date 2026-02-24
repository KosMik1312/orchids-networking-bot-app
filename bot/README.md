# Antre Club — Backend & Bot

Этот раздел содержит исходный код бота (Aiogram 3.x) и API-сервера (FastAPI).

## 🚀 Основные компоненты

*   **`api_server.py`**: Основной бэкенд для MiniApp. Обрабатывает запросы профиля, бронирований и интеграции с ЮKassa.
*   **`bot.py`**: Точка входа для Telegram бота.
*   **`db/`**: Слой работы с данными (SQLAlchemy). Используется **PostgreSQL** (Async).
*   **`locales/`**: Файлы локализации (`ru.json`). Все тексты бота хранятся здесь.

## ⚙️ Установка и запуск

1.  **Окружение**:
    *   `python -m venv venv`
    *   `source venv/bin/activate` (Windows: `venv\Scripts\activate`)
    *   `pip install -r requirements.txt`

2.  **Конфигурация**: Создайте `.env` на основе `.env.example`. Обязательно укажите `BOT_TOKEN`, `MINIAPP_URL`, и параметры `DATABASE_URL` (PostgreSQL).

3.  **Инициализация БД**: `python -m db.init_db` (создаст необходимые таблицы).

4.  **Запуск**: 
    *   Рекомендуемый способ: `./start_services.sh` (интерактивное меню).
    *   Ручной запуск всех служб: `python start_all.py`.

## 🛠️ Скрипты управления

*   **`manage_db.py`**: Командная строка для управления БД.
    *   `python manage_db.py add_admin <ID>` — добавить администратора.
    *   `python manage_db.py recreate` — полная очистка и пересоздание БД.
*   **`check_deps.py`**: Проверка установленных зависимостей.
*   **`fix_slots_null.py`**: Утилита для исправления данных в базе (миграция).

---
Полная проектная документация: [`../README.md`](../README.md)