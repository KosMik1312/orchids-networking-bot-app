# 🎭 Orchids Networking Bot

Telegram-бот для организации тематических ужинов с интересными людьми, интегрированный с MiniApp.

## 📋 Содержание

- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Поддерживаемые БД](#поддерживаемые-бд)
- [Установка](#установка)
- [Запуск](#запуск)
- [Структура проекта](#структура-проекта)

---

## 🚀 Быстрый старт

### Локальная разработка (SQLite)

```bash
# 1. Установи зависимости
pip install -r requirements.txt

# 2. Инициализируй БД
python -m db.init_db

# 3. Запусти приложение
python start_all.py
```

### Production (PostgreSQL на VPS)

см. [DEPLOY.md](../DEPLOY.md) и [QUICKSTART.md](../QUICKSTART.md)

---

## 🏗️ Архитектура

### Компоненты

1. **Telegram Bot** (`bot.py`)
   - Aiogram3 для работы с Telegram API
   - Middleware для обработки команд
   - Интеграция с MiniApp

2. **FastAPI Server** (`api_server.py`)
   - REST API для MiniApp
   - JWT токены для аутентификации
   - Endpoints для профилей, слотов, бронирований

3. **Database** (`db/`)
   - SQLAlchemy ORM
   - Поддержка SQLite и PostgreSQL
   - Асинхронные операции

4. **Payments** (`payments/`)
   - Интеграция с Yookassa
   - Управление платежами

### Структура данных

```
Users (Пользователи)
├── Профиль (имя, возраст, город, интересы...)
├── Контакты (Telegram, Instagram)
└── Предпочтения (уровень комфорта, формат общения...)

DinnerSlots (Слоты ужинов)
├── Дата и время
├── Место (ресторан, город)
├── Максимум участников
└── Статус (активен/неактивен)

Bookings (Бронирования)
├── Пользователь
├── Слот
└── Статус (активна/отменена)

Payments (Платежи)
├── Сумма
├── Статус
└── ID платежа Yookassa
```

---

## 🗄️ Поддерживаемые БД

### SQLite (локальная разработка)

✅ **Преимущества:**
- Простая установка
- Нет конфигурации сервера
- Идеально для разработки

❌ **Ограничения:**
- Одно соединение за раз
- Не подходит для production
- Проблемы с конкурентностью

### PostgreSQL (production на VPS)

✅ **Преимущества:**
- Множество одновременных подключений
- Connection pooling
- Отличная производительность
- ACID транзакции

✅ **Рекомендуется для:**
- Развертывания на VPS
- Production окружения
- Масштабирования

---

## 📦 Установка

### Требования

- Python 3.8+
- pip

### Шаги

```bash
# 1. Клонируй репо
git clone <repo_url>
cd orchids-networking-bot-app/bot

# 2. Создай виртуальное окружение (опционально)
python3 -m venv venv
source venv/bin/activate  # на Windows: venv\Scripts\activate

# 3. Установи зависимости
pip install -r requirements.txt

# 4. Создай .env файл (или скопируй .env.example)
cp ../.env.example .env
# Отредактируй .env с твоими параметрами
```

---

## ▶️ Запуск

### Инициализация БД

```bash
# Создай таблицы в БД (требуется один раз)
python -m db.init_db
```

### Запуск приложения

```bash
# Запуск всего (бот + API сервер)
python start_all.py

# Или отдельно:
python bot.py          # Только бот
python api_server.py   # Только API сервер
```

### Миграция данных (если есть старая БД)

```bash
# Миграция из SQLite в PostgreSQL
python migrate_sqlite_to_postgres.py
```

---

## 📁 Структура проекта

```
bot/
├── api_server.py            # FastAPI приложение
├── bot.py                   # Telegram бот (Aiogram)
├── config.py                # Конфигурация
├── schemas.py               # Pydantic модели
├── requirements.txt         # Зависимости
│
├── db/
│   ├── __init__.py
│   ├── models.py           # SQLAlchemy модели
│   ├── repository.py        # Паттерн репозитория (DAL)
│   ├── session.py           # Инициализация engine и session
│   └── init_db.py           # Скрипт инициализации БД
│
├── commands/
│   ├── user_commands.py     # Команды для пользователей
│   └── admin_commands.py    # Команды для администраторов
│
├── middleware/
│   └── admin_middleware.py  # Middleware для проверки admin'ов
│
├── payments/
│   ├── payment_service.py   # Бизнес-логика платежей
│   ├── payment_config.py    # Конфиг Yookassa
│   └── yookassa_payment.py  # Интеграция с Yookassa
│
└── README.md               # Этот файл
```

---

## ⚙️ Конфигурация

### Переменные окружения (.env)

```bash
# ===== Database =====
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db  # или SQLite URL

# ===== Bot =====
BOT_TOKEN=your_token
MINIAPP_URL=https://your-domain.com
SECRET_KEY=your_secret_key

# ===== Admin =====
ADMIN_IDS=123456789,987654321

# ===== Database Settings =====
DB_POOL_SIZE=5
DB_POOL_MAX_OVERFLOW=10
DB_ECHO=false
```

см. `.env.example` для полного списка

---

## 🔄 Миграция: SQLite → PostgreSQL

Если ты хочешь перенести данные с SQLite на PostgreSQL:

```bash
# 1. Подготовь PostgreSQL БД на VPS (см. DEPLOY.md)
# 2. Настрой .env на целевую PostgreSQL БД
# 3. Запусти скрипт миграции
python migrate_sqlite_to_postgres.py

# Скрипт автоматически:
# - Читает все данные из SQLite (allora.db)
# - Создает таблицы в PostgreSQL
# - Переносит все записи с сохранением целостности
```

---

## 📚 Дополнительная документация

- **[DEPLOY.md](../DEPLOY.md)** - Полное руководство по развертыванию на VPS
- **[QUICKSTART.md](../QUICKSTART.md)** - Краткие команды для быстрого старта
- **[.env.example](../.env.example)** - Примеры конфигурации
- **[bot/ENV_EXAMPLES.py](./ENV_EXAMPLES.py)** - Расширенные примеры

---

## 🛠️ Разработка

### Структура кода

- **SQLAlchemy ORM** - для работы с БД
- **Async/await** - асинхронное программирование
- **Dependency Injection** - в FastAPI
- **Pydantic** - валидация данных

### Запуск в режиме отладки

```bash
# Включи логирование SQL запросов
export DB_ECHO=true
python start_all.py
```

### Проверка здоровья приложения

```bash
# API healthcheck
curl http://localhost:8000/health

# Статистика БД
curl http://localhost:8000/stats
```

---

## 🐛 Решение проблем

### "Cannot import asyncpg"

```bash
pip install asyncpg psycopg2-binary
```

### "Database connection failed"

```bash
# Проверь .env файл
cat .env | grep DATABASE

# Проверь доступность БД
psql -U user -d dbname -c "SELECT 1;"
```

### "Foreign key constraint violation"

Отключи проверку FK во время миграции или очисти несогласованные данные

---

## 📊 Мониторинг и логирование

Логи приложения выводятся в консоль. Для production рекомендуется настроить:

- Systemd service
- Supervisor
- Docker + logging driver
- ELK stack для анализа логов

см. DEPLOY.md для примеров

---

## 🤝 Contributing

1. Создай ветку для своего функционала
2. Следуй стилю кода проекта
3. Пиши тесты для нового кода
4. Сделай pull request

---

## 📄 Лицензия

MIT License

---

**Вопросы?** Смотри [DEPLOY.md](../DEPLOY.md) или [QUICKSTART.md](../QUICKSTART.md)