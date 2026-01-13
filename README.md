# Orchids Networking Bot App

Этот проект — Telegram бот для нетворкинга с встроенным MiniApp (Next.js). Бот помогает организовывать встречи и знакомства (Allora-like).

## Структура проекта

- `src/` — Frontend MiniApp (Next.js)
- `bot/` — Backend Telegram бот на Python (aiogram)
- `public/` — Статические файлы (изображения и т.д.)

## Функционал

### Mini App
- Онбординг (несколько шагов).
- Анкетирование: сбор данных профиля (имя, возраст, пол, семейное положение, фото, о себе и т.д.).
- Выбор города и фильтрация событий.
- Бронирование слотов и симуляция оплаты.
- Профиль: просмотр/редактирование, мои бронирования.

### Telegram Bot
- Приветствие и открытие MiniApp.
- Управление простым flow бронирования и уведомления администратору.
- Сохранение профиля в SQLite.

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

### Backend (Telegram бот)
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
6. Запустить:
   ```bash
   python bot.py
   ```

## База данных
- Пока используется SQLite (aiosqlite). Это нормально для разработки и небольших нагрузок.

## Развертывание
- Frontend: Vercel/другой хостинг для Next.js (необходимо настроить `MINIAPP_URL`).
- Backend: VPS / Railway / Heroku и т.д. Для продакшена рекомендуется перейти на PostgreSQL, но пока оставляем SQLite.

## Файлы изображений
Все изображения в `public/images/` (см. структуру в проекте).

## Полезные переменные
- `BOT_TOKEN` — токен Telegram бота
- `MINIAPP_URL` — публичный URL MiniApp
- `DATABASE_NAME` — файл SQLite (по умолчанию)

## Примечания
- Папку виртуального окружения внутри `bot/` удалили; добавьте venv и .env в `.gitignore`.
- CL (линт/тесты) пока не требуются.

## Контрибьютинг
- Pull requests приветствуются. Проект не хранит виртуальные окружения в репозитории.

## Лицензия
[Укажите лицензию, если применимо]
