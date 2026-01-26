# Orchids Networking Bot App

**Платформа для организации сетевых встреч и знакомств** — Telegram бот с встроенным MiniApp (Next.js), FastAPI backend и интеграцией системы платежей Ю-Кассы.

Архитектура: MiniApp (Next.js на Vercel) ↔ FastAPI (Python на VPS) ↔ Telegram Bot (Aiogram) ↔ SQLite БД + Платежи (YooMoney)

## Структура проекта

```
orchids-networking-bot-app/
├── src/                        # Frontend MiniApp (Next.js 15.5.9)
│   ├── app/                    # Next.js приложение
│   │   ├── api/               # API маршруты (прокси к Python backend)
│   │   │   ├── bookings/
│   │   │   ├── contacts/
│   │   │   ├── health/
│   │   │   ├── profile/
│   │   │   └── slots/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React компоненты экранов
│   │   ├── OnboardingScreen.tsx
│   │   ├── BookingFlow.tsx
│   │   ├── MyBookingsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ContactsScreen.tsx
│   │   └── ui/                # UI компоненты
│   ├── hooks/                 # React хуки
│   └── lib/                   # Утилиты (API клиент, цвета, изображения)
├── bot/                        # Backend (Python 3.12+)
│   ├── api_server.py          # FastAPI приложение (порт 8000)
│   ├── bot.py                 # Telegram бот (Aiogram)
│   ├── config.py              # Конфигурация
│   ├── database.py            # Инициализация БД (aiosqlite)
│   ├── auth_token.py          # JWT токены для безопасности
│   ├── db/                    # ORM модели (SQLAlchemy)
│   │   ├── models.py          # User, DinnerSlot, Booking, Payment модели
│   │   ├── repository.py      # Репозитории (UserRepo, SlotRepo, BookingRepo, PaymentRepo)
│   │   └── session.py         # Async сессии БД
│   ├── commands/              # Telegram команды
│   │   ├── admin_commands.py
│   │   └── user_commands.py
│   ├── middleware/            # Aiogram middleware
│   │   └── admin_middleware.py
│   ├── payments/              # Модуль платежей Ю-Кассы ✨ НОВОЕ
│   │   ├── __init__.py
│   │   ├── payment_config.py  # Конфигурация (Shop ID, Secret Key, Test Mode)
│   │   ├── yookassa_payment.py # SDK обёртка для API Ю-Кассы
│   │   └── payment_service.py # Сервис платежей (create, status, webhook)
│   ├── requirements.txt        # Python зависимости (yookassa==3.2.0)
│   ├── allora.db             # SQLite база данных
│   ├── test_payments.py       # Unit-тест модуля платежей ✨ НОВОЕ
│   ├── migrate_payments.py    # Миграция для создания таблицы payments ✨ НОВОЕ
│   ├── fix_slots_null.py      # Исправление NULL значений в dinner_slots ✨ НОВОЕ
│   ├── start_services.sh      # Управление сервисами (меню)
│   ├── start_all.py           # Запуск всех сервисов
│   └── check_deps.py          # Проверка зависимостей
├── public/                     # Статические файлы
│   └── images/
│       └── onboarding/        # Изображения для онбординга
├── package.json               # Node.js зависимости
├── tsconfig.json              # TypeScript конфигурация
├── next.config.ts             # Next.js конфигурация
├── eslint.config.mjs          # ESLint конфигурация
└── README.md                  # Этот файл
```

## Функционал

### 🎨 MiniApp (Next.js)
- **Онбординг**: 15 экранов для сбора профиля
  - Базовые данные: имя, возраст, пол, город
  - Семья и работа: семейное положение, дети, профессия
  - Интересы: цели, интересы, уровень комфорта
  - Социальное: частота встреч, формат общения, сценарий вечера
  - Фото и о себе: загрузка фото, описание
- **Просмотр слотов**: фильтр по городу, отображение доступных мест
- **Бронирование слотов**: выбор слота, оплата, подтверждение
- **Профиль**: просмотр/редактирование, сохранение на сервер
- **Мои бронирования**: список бронирований с деталями
- **Контакты**: просмотр контактов других участников слота
- **Выход**: безопасный logout

### 🤖 Telegram Бот (Aiogram)
- **/start** — приветствие и открытие MiniApp с JWT токеном
- **Админ-панель** (для администраторов):
  - Создание слотов (дата, время, город, ресторан, количество мест)
  - Управление слотами (активация, деактивация, удаление)
  - Просмотр статистики (пользователи, слоты, бронирования)
  - Рассылка уведомлений пользователям
- **Уведомления**: при бронировании, отмене, оплате ✨
- **Админ-middleware**: проверка прав администратора

### 💳 Система платежей (Ю-Касса) ✨ НОВОЕ
- **Создание платежей**: через API эндпоинт `/api/payments`
- **Режимы работы**: 
  - **Тестовый** (Demo Shop ID: 100500) — бесплатные платежи
  - **Продакшн** — реальные платежи (при наличии Shop ID)
- **Webhook-обработка**: автоматическое обновление статуса платежей
- **Статусы платежей**: created → pending → succeeded/canceled
- **Интеграция**: привязка платежей к бронированиям пользователей
- **Unit-тесты**: 9/9 тестов для проверки работоспособности ✨

### 🔗 API (FastAPI)
- `GET /api/slots` — получение слотов (с фильтром по городу)
- `GET /api/bookings` — получение бронирований пользователя
- `POST /api/bookings` — создание бронирования
- `GET /api/profile` — получение профиля пользователя
- `POST /api/profile` — сохранение профиля
- `GET /api/contacts` — получение контактов участников слота
- **Платежи** ✨:
  - `POST /api/payments` — создание платежа
  - `GET /api/payments/{payment_id}` — получение статуса платежа
  - `POST /api/payments/webhook` — webhook от Ю-Кассы (async обновление)
- `GET /api/health` — проверка здоровья сервера

### 📊 База данных (SQLite + SQLAlchemy ORM)
**Таблицы:**
- `users` — профили пользователей (15+ полей)
- `dinner_slots` — доступные слоты для встреч
- `bookings` — бронирования пользователей
- `payments` ✨ — платежи через Ю-Кассу (yookassa_payment_id, статусы, логи)

**Скрипты утилит:**
- `fix_slots_null.py` — исправление NULL значений в `current_bookings`
- `migrate_payments.py` — создание таблицы `payments` в БД

## Установка и запуск

### Требования
- **Frontend**: Node.js 18+, Bun (опционально)
- **Backend**: Python 3.12+
- **Система**: Ubuntu/Debian (для VPS) или Windows/Mac (для локальной разработки)

### 📦 Зависимости Backend

Основные пакеты в `bot/requirements.txt`:
```
aiogram==3.9.0           # Telegram бот
aiosqlite==0.20.0        # Async SQLite
fastapi==0.109.0         # Web API
uvicorn==0.27.0          # ASGI сервер
sqlalchemy==2.0.25       # ORM
pydantic==2.5.2          # Валидация данных
PyJWT==2.8.1             # JWT токены
yookassa==3.2.0          # Платежи Ю-Кассы ✨
```

### Frontend (MiniApp на Vercel)

1. **Установка зависимостей:**
   ```bash
   bun install
   # или
   npm install
   ```

2. **Локальная разработка:**
   ```bash
   bun dev
   # или
   npm run dev
   ```
   Откройте http://localhost:3000

3. **Сборка и деплой:**
   ```bash
   npm run build
   vercel --prod --yes
   ```

### Backend (Telegram Bot + FastAPI)

1. **Перейти в папку bot:**
   ```bash
   cd bot
   ```

2. **Создать виртуальное окружение:**
   ```bash
   python -m venv venv
   ```

3. **Активировать окружение:**
   - **Windows:** `venv\Scripts\activate`
   - **Linux/Mac:** `source venv/bin/activate`

4. **Установить зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Настроить конфигурацию (`bot/config.py`):**
   ```python
   BOT_TOKEN = "YOUR_BOT_TOKEN"              # От @BotFather
   MINIAPP_URL = "https://your-app.vercel.app"
   SECRET_KEY = "your-secret-key"           # Для JWT
   ADMIN_IDS = [123456789]                  # ID администраторов
   ```

6. **Запустить все сервисы (рекомендуется):**
   ```bash
   python start_all.py
   ```
   
   **Или раздельно:**
   ```bash
   # Терминал 1 - FastAPI
   python -m uvicorn api_server:app --reload --port 8000
   
   # Терминал 2 - Telegram Bot
   python bot.py
   ```

7. **Интерактивное меню управления:**
   ```bash
   bash start_services.sh
   ```
   Дает возможность:
   - Проверить статус процессов
   - Остановить/запустить сервисы
   - Просмотреть логи
   - Миграции БД

### ✨ Проверка интеграции платежей

**Unit-тест модуля:**
```bash
cd bot
python test_payments.py
```

**Ожидаемый результат:**
```
============================================================
   ИТОГИ
============================================================

  [OK]         | Импорты
  [OK]         | Конфигурация
  [OK]         | Инициализация PaymentService
  [OK]         | Методы PaymentService
  [OK]         | Payment ORM модель
  [OK]         | PaymentRepo
  [OK]         | API эндпоинты
  [OK]         | Webhook: payment.succeeded
  [OK]         | Webhook: payment.canceled

Результат: 9/9 тестов пройдено

[SUCCESS] ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! [SUCCESS]
```

**Миграция БД (создание таблицы payments):**
```bash
python migrate_payments.py
```

**Исправление NULL значений в slots:**
```bash
python fix_slots_null.py
```

## Архитектура приложения

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 ФРОНТЕНД (Vercel)                         │
│                    Next.js 15.5.9, React                        │
│                  URL: orchids-app.vercel.app                    │
└────────────────────────────────────┬──────────────────────────────┘
                                     │ HTTPS
                                     │ JWT токен в Authorization
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                🔌 API GATEWAY (Nginx на VPS)                     │
│              api.your-domain.com → localhost:8000                │
│          SSL (Let's Encrypt), CORS, Rate Limiting                │
└────────────────────────────────────┬──────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
          ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐
          │  ⚡ FastAPI     │  │  🤖 Telegram │  │  💾 SQLite  │
          │  (Uvicorn)      │  │  Bot (Aiogram)  │  │  Database  │
          │  PORT: 8000     │  │                 │  │ allora.db  │
          │  /api/*         │  │  /commands      │  │            │
          │  /api/payments/ │  │  /middleware    │  │ ✨ Payment │
          │  /docs          │  │                 │  │   table    │
          └────────┬────────┘  └────────┬────────┘  └─────┬──────┘
                   │                    │                 │
                   └────────────────────┼─────────────────┘
                                        │
                        ┌───────────────┴────────────────┐
                        ▼                                ▼
                   ┌─────────────┐              ┌────────────────┐
                   │ 💳 Ю-Касса  │              │ SQLAlchemy ORM │
                   │ SDK v3.2.0  │              │ (models.py)    │
                   │ Test Mode   │              │                │
                   │ (100500)    │              │ 4 модели:      │
                   │             │              │ - User         │
                   │ Webhook API │              │ - DinnerSlot   │
                   │ (async)     │              │ - Booking      │
                   └─────────────┘              │ - Payment ✨   │
                                               └────────────────┘
```

### Поток данных:

1. **Пользователь** открывает бота `/start` → получает JWT токен
2. **MiniApp** получает токен → передает в заголовке Authorization
3. **FastAPI** проверяет токен → получает user_id → выполняет запрос
4. **Database** обрабатывает запрос → возвращает данные
5. **MiniApp** отображает результат

### Интеграция платежей:

1. **User** выбирает слот → кликает "Оплатить"
2. **MiniApp** вызывает `POST /api/payments` с amount, booking_id
3. **FastAPI** создает платеж в Ю-Кассе (SDK)
4. **Ю-Касса** возвращает confirmation_url
5. **MiniApp** редирект на платежную страницу (Ю-Касса)
6. **User** вводит реквизиты → платеж
7. **Ю-Касса** отправляет webhook → `POST /api/payments/webhook`
8. **FastAPI** обновляет статус платежа в БД
9. **Bot** отправляет уведомление пользователю ✨

## Безопасность

### JWT токены
- Генерируются на бэкенде: `generate_user_token(user_id)`
- Подписаны SECRET_KEY (невозможно подделать)
- Отправляются в заголовке: `Authorization: Bearer <token>`
- Валидируются на каждом запросе: `validate_user_token(token)`
- **Файлы:** `bot/auth_token.py`, `bot/commands/user_commands.py`

### Админ-middleware
- Проверяет ADMIN_IDS перед каждой админ-командой
- Логирует попытки несанкционированного доступа
- **Файл:** `bot/middleware/admin_middleware.py`

### CORS
- Разрешены только запросы с `NEXT_PUBLIC_API_BASE`
- Защита от cross-site request forgery
- **Конфиг:** `bot/api_server.py` (CORSMiddleware)

### Платежи
- Тестовый режим по умолчанию (Demo Shop ID: 100500)
- Webhook подтверждение от Ю-Кассы
- Все платежи логируются в БД
- **Конфиг:** `bot/payments/payment_config.py`

## Запуск на сервере (Продакшен)

### Архитектура сервера

```
VPS (Ubuntu/Debian) с выделенным IP
├── Nginx (reverse proxy, SSL)
│   ├── api.your-domain.com:443 → localhost:8000 (FastAPI)
│   └── HTTP → HTTPS redirect
├── Python 3.12 + venv
│   ├── FastAPI (Uvicorn) на порту 8000
│   │   └── /opt/orchids/bot/api_server.py
│   ├── Telegram Bot (Aiogram)
│   │   └── /opt/orchids/bot/bot.py
│   └── SQLite БД
│       └── /opt/orchids/bot/allora.db
└── Let's Encrypt SSL сертификаты
    └── auto-renewal через certbot
```

### Шаг 1: Подготовка VPS

```bash
# Обновить систему
sudo apt-get update && sudo apt-get upgrade -y

# Установить зависимости
sudo apt-get install -y python3 python3-pip python3-venv git
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Создать папку приложения
sudo mkdir -p /opt/orchids
cd /opt/orchids

# Клонировать репозиторий
git clone <your-repo-url> .

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate
cd bot
pip install -r requirements.txt
```

### Шаг 2: SSL сертификат (Let's Encrypt)

```bash
# Остановить Nginx
sudo systemctl stop nginx

# Получить сертификат
sudo certbot certonly --standalone \
  -d api.your-domain.com \
  -d your-domain.com \
  --agree-tos \
  --email your-email@example.com \
  --non-interactive

# Сертификаты в: /etc/letsencrypt/live/api.your-domain.com/
```

### Шаг 3: Nginx конфигурация

**Файл:** `/etc/nginx/conf.d/api.conf`

```nginx
# HTTP → HTTPS редирект
server {
    listen 80;
    server_name api.your-domain.com your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS для API (FastAPI)
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}

# HTTPS для главного домена (редирект на MiniApp)
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    location / {
        return 301 https://your-miniapp.vercel.app;
    }
}
```

Затем:
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Шаг 4: Запуск сервисов (Systemd)

**FastAPI:** `/etc/systemd/system/orchids-api.service`

```ini
[Unit]
Description=Orchids FastAPI Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/orchids/bot
ExecStart=/opt/orchids/venv/bin/python -m uvicorn api_server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
```

**Telegram Bot:** `/etc/systemd/system/orchids-bot.service`

```ini
[Unit]
Description=Orchids Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/orchids/bot
ExecStart=/opt/orchids/venv/bin/python bot.py
Restart=always
RestartSec=10
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
```

Активировать:
```bash
sudo systemctl daemon-reload
sudo systemctl enable orchids-api orchids-bot
sudo systemctl start orchids-api orchids-bot
sudo systemctl status orchids-api orchids-bot
```

### Шаг 5: Конфигурация переменных окружения

Создайте `/opt/orchids/bot/.env`:

```bash
# Telegram Bot
BOT_TOKEN=YOUR_BOT_TOKEN_FROM_BOTFATHER

# MiniApp
MINIAPP_URL=https://your-miniapp.vercel.app

# Безопасность
SECRET_KEY=your-secret-key-min-32-chars-long

# Администраторы
ADMIN_IDS=123456789,987654321

# Платежи Ю-Кассы ✨
YOOKASSA_SHOP_ID=100500                    # Demo по умолчанию
YOOKASSA_SECRET_KEY=test_secret_key
YOOKASSA_TEST_MODE=true                    # Для продакшена: false
YOOKASSA_RETURN_URL=https://your-app.vercel.app/bookings

# База данных
DATABASE_NAME=/opt/orchids/bot/allora.db
```

Обновите `bot/config.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
MINIAPP_URL = os.getenv("MINIAPP_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",")]
DATABASE_NAME = os.getenv("DATABASE_NAME", "allora.db")
```

### Шаг 6: Проверка на VPS

```bash
# Проверить API
curl -I https://api.your-domain.com

# Проверить статус сервисов
sudo systemctl status orchids-api orchids-bot

# Просмотреть логи
sudo journalctl -u orchids-api -f
sudo journalctl -u orchids-bot -f

# Проверить БД
cd /opt/orchids/bot
source ../venv/bin/activate
python migrate_payments.py
python fix_slots_null.py
```

### Шаг 7: Frontend (Vercel)

1. Обновить `src/lib/api.ts`:
   ```typescript
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.your-domain.com';
   ```

2. В Vercel UI → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE = https://api.your-domain.com
   ```

3. Развернуть:
   ```bash
   vercel --prod --yes
   ```

### 🔄 Auto-renewal SSL сертификата

Let's Encrypt сертификаты на 90 дней. Auto-renewal уже включен:

```bash
# Проверить статус
sudo systemctl status certbot.timer

# Обновить вручную
sudo certbot renew
```

## Конфигурация для деплоя

### Переменные окружения и файлы конфигурации

#### Backend (bot/config.py)
- `BOT_TOKEN`: Токен Telegram бота (получить у @BotFather)
- `MINIAPP_URL`: Публичный URL развернутого MiniApp (например, https://your-app.vercel.app)
- `ADMIN_IDS`: Список ID администраторов через запятую (например, "123456789,987654321")
- `DATABASE_NAME`: Имя файла базы данных SQLite (по умолчанию "allora.db")

#### Frontend (src/lib/api.ts)
- `NEXT_PUBLIC_API_BASE`: URL Python API сервера (например, "https://api.your-domain.com")

### Переменные окружения Vercel
При развертывании на Vercel добавьте:
- `NEXT_PUBLIC_API_BASE = https://api.your-domain.com`

## Файлы изображений
Все изображения в `public/images/` (см. структуру в проекте).

## База данных
- Пока используется SQLite (aiosqlite). Это нормально для разработки и небольших нагрузок.
- Единая база данных для бота и MiniApp
- Для масштабирования рекомендуется перейти на PostgreSQL

## Примечания
- Папку виртуального окружения внутри `bot/` удалили; добавьте venv и .env в `.gitignore`.
- CL (линт/тесты) пока не требуются.

## Контрибьютинг
- Pull requests приветствуются. Проект не хранит виртуальные окружения в репозитории.

## Лицензия
[Укажите лицензию, если применимо]

