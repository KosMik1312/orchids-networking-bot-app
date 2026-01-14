# Orchids Networking Bot App

Этот проект — Telegram бот для нетворкинга с встроенным MiniApp (Next.js). Бот помогает организовывать встречи и знакомства (Allora-like).

## Структура проекта

- `src/` — Frontend MiniApp (Next.js)
- `bot/` — Backend Telegram бот на Python (aiogram)
- `public/` — Статические файлы (изображения и т.д.)

## Функционал

### Mini App
- **Онбординг**: WelcomeScreen, AgeSelectionScreen, GenderSelectionScreen, RelationshipStatusScreen, ChildrenSelectionScreen, OccupationSelectionScreen, GoalSelectionScreen, InterestsSelectionScreen, ComfortSelectionScreen, CommunicationFormatScreen, EveningScenarioScreen, SocialFrequencyScreen, PhotoUploadScreen, AboutMeScreen, CitySelectionScreen.
- **Анкетирование**: сбор данных профиля (имя, возраст, пол, семейное положение, дети, профессия, цели, интересы, уровень комфорта, формат общения, сценарий вечера, частота социальных взаимодействий, фото, о себе, город).
- **Выбор города и фильтрация событий**.
- **Бронирование слотов**: BookingFlow (выбор слота, симуляция оплаты, подтверждение).
- **Профиль**: ProfileScreen (просмотр/редактирование), EditProfileScreen, MyBookingsScreen.
- **Контакты**: ContactsScreen (просмотр контактов после бронирования).

### Telegram Bot
- Приветствие и открытие MiniApp.
- Управление простым flow бронирования и уведомления администратору.
- Сохранение профиля в SQLite.
- Админ-панель: создание слотов, управление, статистика, рассылка.

### API (FastAPI)
- `/api/slots` (GET): получение слотов (с фильтром по городу).
- `/api/bookings` (GET, POST): получение бронирований пользователя, создание бронирования.
- `/api/profile` (GET, POST): получение/сохранение профиля пользователя.
- `/api/contacts` (GET): получение контактов для слота (после бронирования).
- `/api/health` (GET): проверка здоровья сервера.

## Установка и запуск

### Требования
- Node.js 18+ (frontend)
- Python 3.8+ (бот)
- Bun (рекомендуется для frontend, но не обязательно)

### Frontend (miniApp)
1. Установить зависимости:
   ```bash
   bun install
   ```
2. Запустить dev:
   ```bash
   bun dev
   ```
3. Открыть http://localhost:3000

> В `next.config.ts` сейчас стоят `typescript.ignoreBuildErrors: true` и `eslint.ignoreDuringBuilds: true` — оставляем так временно.

### Backend (Telegram бот + API сервер)
1. Перейти в папку `bot/`:
   ```bash
   cd bot
   ```
2. Создать виртуальное окружение:
   ```bash
   python -m venv venv
   ```
3. Активировать:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Установить зависимости:
   ```bash
   pip install -r requirements.txt
   ```
5. Настроить конфигурацию:
   - В проекте сейчас используется `config.py` — пока оставляем его.
   - Обязательные параметры: `BOT_TOKEN`, `MINIAPP_URL`, `DATABASE_NAME` (они должны быть в `config.py` или в переменных окружения).
6. Запустить (2 варианта):
   
   **Вариант 1 - Все вместе:**
   ```bash
   python start_all.py
   ```
   
   **Вариант 2 - Раздельно:**
   ```bash
   # Терминал 1 - API сервер
   python api_server.py
   
   # Терминал 2 - Telegram бот
   python bot.py
   ```

## Архитектура

### Новая архитектура (FastAPI + Aiogram)
- **Python Backend**: Единая база данных SQLite
- **FastAPI Server**: HTTP API для связи с MiniApp (`bot/api_server.py`)
- **Aiogram Bot**: Telegram бот для админки (`bot/bot.py`)
- **Next.js MiniApp**: Фронтенд через HTTP API (`src/`)

### Поток данных
1. Админ создает слоты через Telegram бот
2. Данные сохраняются в Python базу
3. MiniApp получает данные через FastAPI
4. Пользователи заполняют профили в MiniApp
5. Бот может получать данные пользователей

## Конфигурация для деплоя

### Переменные окружения и файлы конфигурации

#### Backend (bot/config.py)
- `BOT_TOKEN`: Токен Telegram бота (получить у @BotFather)
- `MINIAPP_URL`: Публичный URL развернутого MiniApp (например, https://your-app.vercel.app)
- `ADMIN_IDS`: Список ID администраторов через запятую (например, "123456789,987654321")
- `DATABASE_NAME`: Имя файла базы данных SQLite (по умолчанию "allora.db")

#### Frontend (src/lib/api.ts)
- `API_BASE`: URL Python API сервера (например, "https://your-server.com" или "http://localhost:8000" для локальной разработки)

### Настройка переменных окружения
- Для backend: создать `.env` файл в папке `bot/` или задать переменные в системе.
- Для frontend: переменные можно задать в Vercel или других платформах, но пока жестко в коде.

## Развертывание
- Frontend: Vercel/другой хостинг для Next.js (необходимо настроить `MINIAPP_URL`).
- Backend: VPS / Railway / Heroku и т.д. Для продакшена рекомендуется перейти на PostgreSQL, но пока оставляем SQLite.

## Файлы изображений
Все изображения в `public/images/` (см. структуру в проекте).

## Полезные переменные
См. раздел "Конфигурация для деплоя" выше.

## База данных
- Пока используется SQLite (aiosqlite). Это нормально для разработки и небольших нагрузок.
- Единая база данных для бота и MiniApp

## Примечания
- Папку виртуального окружения внутри `bot/` удалили; добавьте venv и .env в `.gitignore`.
- CL (линт/тесты) пока не требуются.

## Контрибьютинг
- Pull requests приветствуются. Проект не хранит виртуальные окружения в репозитории.

## Лицензия
[Укажите лицензию, если применимо]
