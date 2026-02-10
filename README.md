# Orchids Networking Bot App

**Платформа для организации сетевых встреч и знакомств** — Telegram бот с встроенным MiniApp (Next.js), FastAPI backend и интеграцией системы платежей Ю-Кассы.

## 🚀 Архитектура

`MiniApp (Next.js на Vercel)` ↔ `FastAPI (Python на VPS)` ↔ `Telegram Bot (Aiogram)` ↔ `PostgreSQL / SQLite`

### Основные компоненты

*   **Frontend**: Next.js 15.5.9 (Vercel)
*   **Backend**: FastAPI + Aiogram 3.9 (VPS)
*   **База данных**: SQLAlchemy (Async), поддерживает SQLite (dev) и PostgreSQL (prod)
*   **Платежи**: ЮKassa API (Webhooks)

## 🛠️ Функционал

### 🎨 MiniApp
*   **Онбординг**: 15 экранов для создания детального профиля.
*   **Слоты**: Просмотр доступных ужинов, фильтрация по городам.
*   **Бронирование**: Оплата участия через ЮKassa, получение билета.
*   **Профиль**: Редактирование данных, просмотр своих бронирований.

### 🤖 Telegram Бот
*   **/start**: Вход в MiniApp с автоматической авторизацией (JWT).
*   **Уведомления**: О статусе оплаты, напоминания о встречах.

### 👮 Админ-панель
*   **Управление слотами**: Создание, редактирование, деактивация мероприятий.
*   **Управление пользователями**: Просмотр профилей, назначение администраторов.
*   **Статистика**: Обзор ключевых метрик.
*   **Управление БД**: Возможность пересоздания базы данных и добавления администраторов через CLI.

## 📦 Установка и запуск

### Требования
*   Python 3.12+
*   Node.js 18+

### Backend (Локально)

1.  **Настройка окружения**:
    ```bash
    cd bot
    python -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

2.  **Конфигурация**:
    Создайте файл `bot/.env` (см. `bot/.env.example`):
    ```env
    BOT_TOKEN=123:ABC...
    MINIAPP_URL=https://your-app.vercel.app
    SECRET_KEY=super-secret-key
    ADMIN_IDS=123456789
    ```

3.  **Инициализация БД**:
    ```bash
    # Создаст allora.db
    python -m db.init_db
    ```

4.  **Запуск**:
    ```bash
    # Интерактивное меню управления
    bash start_services.sh
    
    # Или вручную
    python start_all.py
    ```

### Frontend (Локально)

1.  **Установка**:
    ```bash
    npm install
    ```

2.  **Запуск**:
    ```bash
    npm run dev
    ```

## 🔧 Управление (CLI)

В проекте есть скрипт `bot/manage_db.py` для администрирования:

*   **Добавить администратора**:
    ```bash
    python bot/manage_db.py add_admin <USER_ID>
    ```
*   **Пересоздать базу данных** (Осторожно! Удаляет все данные):
    ```bash
    python bot/manage_db.py recreate
    ```
    *Или используйте меню `start_services.sh` (пункты 10 и 11).*

## 🔒 Безопасность

*   **JWT**: Аутентификация между MiniApp и Backend.
*   **Admin Middleware**: Защита административных команд и эндпоинтов.
*   **Validation**: Pydantic схемы для всех входных данных.

## 📂 Структура проекта

*   `src/`: Исходный код Frontend (Next.js)
*   `bot/`: Исходный код Backend (Python)
    *   `api_server.py`: FastAPI приложение
    *   `bot.py`: Telegram бот
    *   `db/`: Работа с базой данных (модели, репозитории)
    *   `payments/`: Интеграция с ЮKassa
    *   `utils.py`: Утилиты (форматирование дат и пр.)

---
**Разработано для Orchids Networking**
