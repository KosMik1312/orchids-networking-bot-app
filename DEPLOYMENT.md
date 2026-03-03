# 🚀 Инструкция по развертыванию Antre Club Bot

## 📋 Требования к серверу

- **ОС**: Ubuntu 20.04+ / Debian 11+
- **RAM**: Минимум 1GB (рекомендуется 2GB)
- **Диск**: Минимум 20GB свободного места
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Домен**: Обязательно (для Telegram MiniApp и ЮKassa)

---

## ⚠️ ВАЖНО: БЕЗОПАСНОСТЬ

**ПЕРЕД ДЕПЛОЕМ:**

1. **Смени все токены и пароли** если они были в открытом доступе:
   - BOT_TOKEN (через @BotFather команда `/revoke`)
   - ЮKassa ключи (перевыпусти в личном кабинете)
   - DB_PASSWORD (придумай новый)
   - SECRET_KEY (сгенерируй новый)

2. **Убедись что `.env` в `.gitignore`** (уже добавлено)

3. **Никогда не коммить `.env` в Git!**

---

## 🔧 ШАГ 1: Подготовка сервера

### 1.1. Подключение к серверу

```bash
ssh root@176.124.208.58
```

### 1.2. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### 1.3. Установка необходимых пакетов

```bash
# Если Docker еще не установлен
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Проверка
docker --version
docker compose version

# Установка дополнительных утилит
sudo apt install -y git certbot net-tools
```

### 1.4. Настройка Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable
sudo ufw status
```

---

## 📦 ШАГ 2: Клонирование проекта

```bash
# Создать директорию
sudo mkdir -p /opt/antre-club
sudo chown $USER:$USER /opt/antre-club

# Клонировать репозиторий
cd /opt/antre-club
git clone https://github.com/KosMik1312/orchids-networking-bot-app.git .

# Или загрузить по FTP в /opt/antre-club/
```

---

## 🔑 ШАГ 3: Получение API ключей

### 3.1. Telegram Bot Token

1. Открой https://t.me/BotFather
2. Отправь команду `/newbot`
3. Следуй инструкциям
4. Скопируй токен (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Настрой команды бота:
   ```
   /setcommands
   start - Начать работу с ботом
   help - Помощь
   ```
6. Настрой MiniApp:
   ```
   /newapp
   # Укажи URL: https://your-domain.com
   ```

### 3.2. ЮKassa (Платежная система)

1. Зарегистрируйся на https://yookassa.ru
2. Пройди верификацию
3. Перейди в раздел "Интеграция"
4. Скопируй:
   - **shopId** (ID магазина)
   - **Секретный ключ** (начинается с `live_`)
5. Настрой Webhook:
   - URL: `https://your-domain.com/api/yookassa/webhook`
   - События: `payment.succeeded`, `payment.canceled`

### 3.3. Telegram ID администратора

1. Открой https://t.me/userinfobot
2. Отправь любое сообщение
3. Скопируй свой ID (например: `123456789`)

---

## ⚙️ ШАГ 4: Настройка переменных окружения

```bash
cd /opt/antre-club

# Создать .env из шаблона
cp .env.example .env

# Отредактировать
nano .env
```

### Заполни все переменные:

```bash
# ДОМЕН (ОБЯЗАТЕЛЬНО!)
DOMAIN=your-domain.com

# БАЗА ДАННЫХ (придумай сложный пароль)
DB_PASSWORD=your_strong_password_123

# TELEGRAM BOT (от @BotFather)
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=your_bot_username

# ЮKASSA
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=live_your_secret_key_here
YOOKASSA_TEST_MODE=false

# JWT СЕКРЕТ (сгенерируй)
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(48))")

# АДМИНИСТРАТОРЫ (твой Telegram ID)
ADMIN_IDS=123456789
```

**Сохрани файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🌐 ШАГ 5: Настройка DNS

Настрой A-запись для домена:

```
Тип: A
Имя: @ (или your-domain.com)
Значение: 176.124.208.58
TTL: 3600
```

**Проверка:**
```bash
ping your-domain.com
# Должен отвечать 176.124.208.58
```

---

## 🔒 ШАГ 6: Получение SSL сертификата

### Вариант A: Let's Encrypt (РЕКОМЕНДУЕТСЯ)

```bash
# Остановить Nginx если запущен
docker compose down nginx 2>/dev/null

# Получить сертификат
sudo certbot certonly --standalone -d your-domain.com

# Скопировать в проект
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/antre-club/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/antre-club/nginx/ssl/
sudo chown $USER:$USER /opt/antre-club/nginx/ssl/*.pem
sudo chmod 644 /opt/antre-club/nginx/ssl/*.pem
```

### Автообновление сертификата:

```bash
# Добавить в crontab
sudo crontab -e

# Добавить строку:
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem /opt/antre-club/nginx/ssl/ && docker compose -f /opt/antre-club/docker-compose.yml restart nginx
```

---

## 🚀 ШАГ 7: Запуск приложения

```bash
cd /opt/antre-club

# Сделать скрипты исполняемыми
chmod +x scripts/*.sh

# Запустить деплой
./scripts/deploy.sh
```

Скрипт автоматически:
- Проверит все зависимости
- Проверит переменные окружения
- Запустит все контейнеры
- Покажет статус

---

## ✅ ШАГ 8: Проверка работоспособности

### 8.1. Проверка контейнеров

```bash
docker compose ps

# Все контейнеры должны быть в статусе "Up"
```

### 8.2. Проверка логов

```bash
# Все логи
docker compose logs -f

# Только backend
docker compose logs -f backend

# Только frontend
docker compose logs -f frontend
```

### 8.3. Проверка доступности

```bash
# Frontend
curl -I https://your-domain.com

# Backend API
curl https://your-domain.com/api/health
```

### 8.4. Проверка Telegram бота

1. Открой бота в Telegram
2. Отправь `/start`
3. Должен ответить и показать MiniApp

---

## 🔄 Обновление кода (еженедельные правки)

### Вариант 1: Через Git

```bash
cd /opt/antre-club
./scripts/update.sh
```

### Вариант 2: Через FTP

1. Подключись по FTP к серверу
2. Загрузи измененные файлы в `/opt/antre-club/bot/` или `/opt/antre-club/src/`
3. Перезапусти нужный сервис:
   ```bash
   docker compose restart backend
   # или
   docker compose restart frontend
   ```

### Вариант 3: Прямо на сервере

```bash
ssh root@176.124.208.58
nano /opt/antre-club/bot/api_server.py
# Внеси изменения
docker compose restart backend
```

---

## 💾 Бэкап базы данных

### Создание бэкапа

```bash
cd /opt/antre-club
./scripts/backup.sh
```

Бэкапы сохраняются в `./backups/`

### Восстановление из бэкапа

```bash
gunzip < ./backups/antre_club_20240303_120000.sql.gz | \
  docker compose exec -T postgres psql -U antre_user antre_club_db
```

### Автоматический бэкап (каждый день в 2:00)

```bash
crontab -e

# Добавить:
0 2 * * * cd /opt/antre-club && ./scripts/backup.sh
```

---

## 🛠️ Полезные команды

```bash
# Статус контейнеров
docker compose ps

# Логи (все)
docker compose logs -f

# Логи (конкретный сервис)
docker compose logs -f backend

# Перезапуск сервиса
docker compose restart backend

# Остановка всех сервисов
docker compose down

# Запуск всех сервисов
docker compose up -d

# Пересборка (если менял Dockerfile)
docker compose up -d --build

# Использование ресурсов
docker stats

# Очистка неиспользуемых образов
docker system prune -a
```

---

## 🐛 Troubleshooting

### Проблема: Контейнер не запускается

```bash
# Проверить логи
docker compose logs backend

# Проверить переменные окружения
docker compose config
```

### Проблема: Нет доступа к сайту

```bash
# Проверить порты
sudo netstat -tulpn | grep -E ':(80|443)'

# Проверить Nginx
docker compose logs nginx

# Проверить SSL сертификаты
ls -la nginx/ssl/
```

### Проблема: Telegram бот не отвечает

```bash
# Проверить логи бота
docker compose logs backend | grep -i error

# Проверить webhook
curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
```

### Проблема: Мало памяти

```bash
# Проверить использование
free -h
docker stats

# Создать swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Проблема: База данных не подключается

```bash
# Проверить PostgreSQL
docker compose exec postgres psql -U antre_user -d antre_club_db -c "SELECT 1;"

# Проверить пароль в .env
cat .env | grep DB_PASSWORD
```

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверь логи: `docker compose logs -f`
2. Проверь переменные: `cat .env`
3. Проверь статус: `docker compose ps`
4. Проверь ресурсы: `free -h && df -h`

---

## 🎉 Готово!

Твой бот работает на:
- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api
- **Telegram Bot**: @your_bot_username

**Следующие шаги:**
1. Протестируй все функции
2. Настрой автоматические бэкапы
3. Настрой мониторинг (опционально)
4. Добавь других администраторов в ADMIN_IDS
