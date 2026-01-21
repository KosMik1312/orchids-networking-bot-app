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

## Запуск на сервере (Продакшен)

### Запуск бота в фоновом режиме
Бот должен работать постоянно на сервере и не прерываться при закрытии SSH соединения.

#### Вариант 1: nohup (простой)
```bash
cd /path/to/bot
source venv/bin/activate
nohup python start_all.py > bot.log 2>&1 &
```

Проверить процесс:
```bash
ps aux | grep python
```

#### Вариант 2: screen (удобный)
```bash
cd /path/to/bot
source venv/bin/activate
screen -S bot_session
python start_all.py
# Нажать Ctrl+A, затем D для отделения сессии
```

Восстановить сессию:
```bash
screen -r bot_session
```

#### Вариант 3: systemd (профессиональный)
Создать файл `/etc/systemd/system/orchids-bot.service`:
```ini
[Unit]
Description=Orchids Networking Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/bot
ExecStart=/path/to/bot/venv/bin/python start_all.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запустить:
```bash
sudo systemctl start orchids-bot
sudo systemctl enable orchids-bot  # Автозапуск при перезагрузке
sudo systemctl status orchids-bot  # Проверить статус
```
## Конфигурация для деплоя

### Переменные окружения и файлы конфигурации

#### Backend (bot/config.py)
- `BOT_TOKEN`: Токен Telegram бота (получить у @BotFather)
- `MINIAPP_URL`: Публичный URL развернутого MiniApp (например, https://your-app.vercel.app)
- `SECRET_KEY`: Секретный ключ для подписи JWT токенов (обязателен в продакшене!)
- `ADMIN_IDS`: Список ID администраторов через запятую (например, "123456789,987654321")
- `DATABASE_NAME`: Имя файла базы данных SQLite (по умолчанию "allora.db")

#### Frontend (src/lib/api.ts)
- `API_BASE`: URL Python API сервера (например, "https://your-server.com" или "http://localhost:8000" для локальной разработки)

## Получение Telegram ID (JWT токены)

**Логика:**
1. Пользователь нажимает "Начать!" в боте
2. Бот получает ID: `message.from_user.id` (безопасно от Telegram)
3. Бот генерирует JWT токен: `token = generate_user_token(user_id)`
4. Бот отправляет ссылку: `app.com?token=<JWT>`
5. Фронтенд декодирует токен: `jwtDecode(token)` → получает `user_id`
6. Фронтенд отправляет токен в заголовке: `Authorization: Bearer <token>`
7. Бэкенд проверяет токен: `validate_user_token(token)` → извлекает `user_id`

**Почему это правильно:**
- ✅ ID получается от Telegram (на бэкенде), не от клиента
- ✅ Токен подписан SECRET_KEY (клиент не может подделать)
- ✅ Нет ненадёжного polling на фронтенде
- ✅ Полная безопасность и контроль на бэкенде

**Файлы:**
- `bot/auth_token.py` - генерация и валидация JWT
- `bot/commands/user_commands.py` - создание токена при /start
- `src/app/page.tsx` - декодирование токена
- `src/lib/api.ts` - отправка токена в запросах

### Настройка переменных окружения
- Для backend: создать `.env` файл в папке `bot/` или задать переменные в системе.
- Для frontend: переменные можно задать в Vercel или других платформах, но пока жестко в коде.

## Развертывание

### Архитектура приложения

Приложение использует трёхуровневую архитектуру:

1. **Frontend MiniApp** (Next.js) - развернут на Vercel или аналогичной платформе
2. **Backend API** (FastAPI) - Python API сервер на VPS с поддержкой HTTPS
3. **Telegram Bot** (Aiogram) - работает на том же VPS вместе с API
4. **База данных** (SQLite) - находится на VPS

### Шаг 1: Подготовка VPS сервера

#### Требования к серверу:
- Ubuntu/Debian VPS с выделенным IP или проксированием портов
- Python 3.8+
- Nginx (для reverse proxy и SSL)
- Домен (например, `your-domain.com`)

#### Установка на VPS:
```bash
# Обновить пакеты
sudo apt-get update && sudo apt-get upgrade -y

# Установить Python и зависимости
sudo apt-get install -y python3 python3-pip python3-venv
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Клонировать репозиторий
git clone <your-repo-url> /opt/bot
cd /opt/bot

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установить зависимости
cd bot
pip install -r requirements.txt
```

### Шаг 2: Получение SSL сертификата через Let's Encrypt

```bash
# Остановить Nginx (если работает)
sudo systemctl stop nginx

# Получить сертификат для вашего домена
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d api.your-domain.com \
  -d www.your-domain.com \
  --agree-tos \
  --email your-email@example.com \
  --non-interactive

# Сертификаты будут в: /etc/letsencrypt/live/your-domain.com/
```

### Шаг 3: Настройка Nginx как reverse proxy

Создайте файл конфигурации `/etc/nginx/conf.d/api.conf`:

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

Вставьте:

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com api.your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS for API
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name api.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
        proxy_read_timeout 60s;
    }
}

# HTTPS for main domain (optional)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        return 301 https://your-miniapp-url.vercel.app;
    }
}
```

**Сохранить:** Ctrl+X, Y, Enter

Затем:
```bash
# Проверить синтаксис
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Шаг 4: Обновить конфигурацию Backend

Отредактируйте `/opt/bot/bot/config.py`:

```python
import os

# Telegram Bot Token (получить у @BotFather)
BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

# URL вашего MiniApp (где развернут Next.js frontend)
MINIAPP_URL = os.getenv("MINIAPP_URL", "https://your-miniapp.vercel.app")

# Администраторы (Telegram ID)
_admin_ids_env = os.getenv("ADMIN_IDS", "")
if _admin_ids_env:
    try:
        ADMIN_IDS = [int(x.strip()) for x in _admin_ids_env.split(",") if x.strip()]
    except ValueError:
        ADMIN_IDS = []
else:
    ADMIN_IDS = [123456789]  # Замените на реальные ID

# База данных
DATABASE_NAME = os.getenv("DATABASE_NAME", "allora.db")
```

### Шаг 5: Запустить Backend сервисы

**Вариант 1 - Все в одном процессе (простой):**

```bash
cd /opt/bot
source venv/bin/activate
nohup python -m uvicorn bot.api_server:app --host 127.0.0.1 --port 8000 > api.log 2>&1 &
nohup python bot/bot.py > bot.log 2>&1 &
```

**Вариант 2 - Через systemd (рекомендуется для продакшена):**

Создайте файл `/etc/systemd/system/orchids-api.service`:

```ini
[Unit]
Description=Orchids API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bot
ExecStart=/opt/bot/venv/bin/python -m uvicorn bot.api_server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Создайте файл `/etc/systemd/system/orchids-bot.service`:

```ini
[Unit]
Description=Orchids Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bot
ExecStart=/opt/bot/venv/bin/python bot/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Затем:
```bash
sudo systemctl daemon-reload
sudo systemctl enable orchids-api orchids-bot
sudo systemctl start orchids-api orchids-bot
sudo systemctl status orchids-api orchids-bot
```

### Шаг 6: Обновить Frontend (Vercel или другой хостинг)

1. В `src/lib/api.ts` обновить API_BASE:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.your-domain.com';
```

2. Развернуть на Vercel:
```bash
# Установить Vercel CLI
npm i -g vercel

# Залогиниться
vercel login

# Развернуть
vercel --prod
```

3. Или добавить переменную окружения в Vercel UI:
   - Settings → Environment Variables
   - `NEXT_PUBLIC_API_BASE = https://api.your-domain.com`

### Шаг 7: Настройка DNS (регистратор домена)

1. Перейти на сайт регистратора домена
2. Найти настройки DNS
3. Добавить A-записи:
   ```
   Домен: your-domain.com → IP вашего VPS
   Поддомен: api.your-domain.com → IP вашего VPS
   Поддомен: www.your-domain.com → IP вашего VPS
   ```

4. Если используется проксирование портов (например, на Jino.ru):
   - Отключить проксирование SSL для выделенного IP
   - Или настроить проксирование на внутренний порт (например, 8000)

5. Подождать 15-30 минут для распространения DNS

### Шаг 8: Проверка

**Проверить, что API доступен:**
```bash
curl -I https://api.your-domain.com
curl -I https://api.your-domain.com/docs
```

**Проверить CORS:**
```bash
curl -X OPTIONS https://api.your-domain.com/api/profile \
  -H "Origin: https://your-miniapp.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**В браузере:**
- Откройте ваш MiniApp на Vercel
- Откройте DevTools (F12) → Console
- Должна быть: `🔧 API_BASE: https://api.your-domain.com`
- Network tab должен показывать запросы к `api.your-domain.com`

### Автоматическое обновление SSL сертификата

Let's Encrypt сертификаты действуют 90 дней. Автоматическое обновление уже настроено:

```bash
# Проверить статус
sudo systemctl status certbot.timer

# Или обновить вручную
sudo certbot renew --dry-run
```

### Решение проблем

**Ошибка ERR_CERT_COMMON_NAME_INVALID в браузере:**
- Очистить кеш браузера полностью (Ctrl+Shift+Delete)
- Открыть в приватном окне
- Проверить, что в Jino.ru отключено проксирование SSL для вашего IP

**FastAPI недоступен:**
- Проверить, что процесс запущен: `ps aux | grep uvicorn`
- Проверить логи: `tail -f /opt/bot/api.log`
- Проверить, что Nginx работает: `sudo systemctl status nginx`

**Бот не отвечает:**
- Проверить токен в config.py
- Проверить логи: `tail -f /opt/bot/bot.log`
- Проверить подключение: `curl https://api.telegram.org/bot<TOKEN>/getMe`

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

