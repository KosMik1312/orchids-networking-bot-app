# Antre Club — Networking Bot App

**Платформа для организации сетевых встреч и знакомств** — Telegram бот с встроенным MiniApp (Next.js), FastAPI backend и интеграцией системы платежей ЮKassa.

## 🚀 Архитектура

`MiniApp (Next.js)` ↔ `Nginx` ↔ `FastAPI (Python)` ↔ `Telegram Bot (Aiogram)` ↔ `PostgreSQL`

### Технологический стек
*   **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
*   **Backend**: FastAPI, Aiogram 3.x
*   **База данных**: PostgreSQL + SQLAlchemy (Async)
*   **Платежи**: ЮKassa API (Webhooks)
*   **Инфраструктура**: Docker, Docker Compose, Nginx

## 🛠️ Основные функции

### 📱 Для пользователя
*   **Умный профиль**: Детальный онбординг для подбора идеальной компании
*   **Афиша**: Просмотр и бронирование предстоящих ужинов в один клик
*   **Оплата ЮКасса**: Безопасная оплата с автоматическими уведомлениями в Telegram
*   **Мои контакты**: Просмотр анкет участников прошедших встреч, сгруппированных по мероприятиям
*   **Командный дух**: Специальные метки для участников вашей команды на ужине

### 👮 Для администратора
*   **Управление слотами**: Гибкое создание и редактирование мероприятий
*   **Smart Grouping**: Автоматическое и ручное распределение участников по командам
*   **Мониторинг платежей**: Просмотр всех транзакций, статистика выручки и конверсии
*   **Рассылки**: Уведомление всех пользователей о новых событиях
*   **Dashboard**: Наглядная статистика по бронированиям и пользователям

---

## 📦 Production Deployment

### 🚀 Быстрый старт

```bash
# 1. Клонировать проект
git clone https://github.com/KosMik1312/orchids-networking-bot-app.git
cd orchids-networking-bot-app

# 2. Настроить переменные окружения
cp .env.example .env
nano .env  # Заполнить все переменные

# 3. Получить SSL сертификат
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ./nginx/ssl/

# 4. Запустить
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 📖 Полная инструкция

**Детальная пошаговая инструкция:** [DEPLOYMENT.md](DEPLOYMENT.md)

### 🔑 Где получить API ключи

| Сервис | Где получить | Документация |
|--------|--------------|-------------|
| **Telegram Bot Token** | [@BotFather](https://t.me/BotFather) → `/newbot` | [Telegram Bot API](https://core.telegram.org/bots) |
| **ЮKassa** | [yookassa.ru](https://yookassa.ru) → Интеграция | [ЮKassa API](https://yookassa.ru/developers) |
| **Telegram ID** | [@userinfobot](https://t.me/userinfobot) | - |

### ⚙️ Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DOMAIN` | Домен приложения (обязательно!) | `antre-club.ru` |
| `BOT_TOKEN` | Токен Telegram бота | `1234567890:ABC...` |
| `BOT_USERNAME` | Username бота без @ | `antre_club_bot` |
| `DB_PASSWORD` | Пароль для PostgreSQL | `strong_password_123` |
| `SECRET_KEY` | JWT секрет (мин. 32 символа) | Сгенерировать: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ADMIN_IDS` | Telegram ID админов через запятую | `123456789,987654321` |
| `YOOKASSA_SHOP_ID` | ID магазина ЮKassa | `123456` |
| `YOOKASSA_SECRET_KEY` | Секретный ключ ЮKassa | `live_...` |

**Полный список:** см. [.env.example](.env.example)

---

## 💻 Разработка (Development)

### Требования
*   Python 3.12+
*   Node.js 18+
*   PostgreSQL 15+

### Локальный запуск

**Backend:**
```bash
cd bot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Настрой .env
python start_all.py
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## 🔄 Обновление кода

### Через Git:
```bash
cd /opt/antre-club
./scripts/update.sh
```

### Через FTP:
1. Загрузи измененные файлы в `/opt/antre-club/bot/` или `/opt/antre-club/src/`
2. Перезапусти: `docker compose restart backend`

---

## 💾 Бэкап базы данных

```bash
# Создать бэкап
./scripts/backup.sh

# Восстановить из бэкапа
gunzip < ./backups/antre_club_20240303.sql.gz | \
  docker compose exec -T postgres psql -U antre_user antre_club_db
```

---

## 🛠️ Полезные команды

```bash
# Статус контейнеров
docker compose ps

# Логи
docker compose logs -f
docker compose logs -f backend

# Перезапуск
docker compose restart backend

# Остановка
docker compose down

# Запуск
docker compose up -d
```

---

## 🔒 Безопасность

*   **JWT**: Защищенная авторизация между MiniApp и Backend
*   **HTTPS**: Обязательно для Telegram MiniApp (Let's Encrypt)
*   **Docker**: Изоляция сервисов
*   **Environment Variables**: Все секреты в `.env` (не в Git!)
*   **Middleware**: Проверка прав администратора

### ⚠️ ВАЖНО:
- **НИКОГДА** не коммить `.env` файлы в Git
- Используй сложные пароли (мин. 16 символов)
- Регулярно обновляй зависимости
- Делай бэкапы базы данных

---

## 📞 Поддержка

**Проблемы при развертывании?** См. раздел Troubleshooting в [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Разработано для Antre Club**