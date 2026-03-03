# 🚀 БЫСТРЫЙ СТАРТ - Antre Club Bot

## ⚠️ КРИТИЧНО: БЕЗОПАСНОСТЬ

**ПЕРЕД ДЕПЛОЕМ СМЕНИ ВСЕ ТОКЕНЫ:**
- BOT_TOKEN (через @BotFather команда `/revoke`)
- ЮKassa ключи
- DB_PASSWORD
- SECRET_KEY

Файл `bot/.env` был в открытом доступе на GitHub!

---

## 📦 ЧТО СДЕЛАНО

### ✅ Созданные файлы:

1. **docker-compose.yml** - Оркестрация всех сервисов (PostgreSQL + Backend + Frontend + Nginx)
2. **.env.example** - Шаблон переменных окружения
3. **.gitignore** - Обновлен (игнорирует .env файлы)
4. **nginx/nginx.conf** - Конфигурация Nginx с SSL
5. **nginx/ssl/README.md** - Инструкция по SSL
6. **scripts/deploy.sh** - Скрипт первого деплоя
7. **scripts/update.sh** - Скрипт обновления кода
8. **scripts/backup.sh** - Скрипт бэкапа БД
9. **DEPLOYMENT.md** - Полная инструкция по развертыванию
10. **README.md** - Обновлен с информацией о продакшене

---

## 🎯 АРХИТЕКТУРА

```
Docker Compose:
├── PostgreSQL (256MB RAM) - Своя отдельная БД
├── Backend (256MB RAM) - Код на сервере через volume
├── Frontend (256MB RAM) - Код на сервере через volume
└── Nginx (128MB RAM) - Reverse proxy + SSL

Итого: ~750MB из 961MB
```

**Код доступен на сервере:**
- Backend: `/opt/antre-club/bot/`
- Frontend: `/opt/antre-club/src/`

**Правки БЕЗ пересборки:**
- Измени файлы по FTP
- Выполни: `docker compose restart backend`

---

## 🚀 ДЕПЛОЙ НА СЕРВЕР (176.124.208.58)

### Шаг 1: Подготовка сервера

```bash
ssh root@176.124.208.58

# Обновить систему
sudo apt update && sudo apt upgrade -y
sudo reboot

# После перезагрузки
ssh root@176.124.208.58

# Установить certbot
sudo apt install -y certbot
```

### Шаг 2: Клонирование проекта

```bash
# Создать директорию
sudo mkdir -p /opt/antre-club
sudo chown $USER:$USER /opt/antre-club

# Клонировать
cd /opt/antre-club
git clone https://github.com/KosMik1312/orchids-networking-bot-app.git .
```

### Шаг 3: Настройка .env

```bash
cd /opt/antre-club
cp .env.example .env
nano .env
```

**Заполни:**
- `DOMAIN` - твой домен
- `BOT_TOKEN` - НОВЫЙ токен от @BotFather
- `BOT_USERNAME` - username бота
- `DB_PASSWORD` - придумай сложный пароль
- `SECRET_KEY` - сгенерируй: `python3 -c "import secrets; print(secrets.token_urlsafe(48))"`
- `ADMIN_IDS` - твой Telegram ID (узнать: @userinfobot)
- `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`

### Шаг 4: Настройка DNS

Настрой A-запись:
```
Тип: A
Имя: @ (или твой домен)
Значение: 176.124.208.58
```

Проверь: `ping your-domain.com`

### Шаг 5: SSL сертификат

```bash
# Получить сертификат
sudo certbot certonly --standalone -d your-domain.com

# Скопировать в проект
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/antre-club/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/antre-club/nginx/ssl/
sudo chown $USER:$USER /opt/antre-club/nginx/ssl/*.pem
sudo chmod 644 /opt/antre-club/nginx/ssl/*.pem
```

### Шаг 6: Запуск

```bash
cd /opt/antre-club
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### Шаг 7: Проверка

```bash
# Статус
docker compose ps

# Логи
docker compose logs -f

# Проверка сайта
curl -I https://your-domain.com

# Проверка API
curl https://your-domain.com/api/health
```

---

## 🔄 ОБНОВЛЕНИЕ КОДА (раз в неделю)

### Вариант 1: Git
```bash
cd /opt/antre-club
./scripts/update.sh
```

### Вариант 2: FTP
1. Загрузи файлы в `/opt/antre-club/bot/` или `/opt/antre-club/src/`
2. Выполни: `docker compose restart backend`

### Вариант 3: Прямо на сервере
```bash
ssh root@176.124.208.58
nano /opt/antre-club/bot/api_server.py
# Внеси изменения
docker compose restart backend
```

---

## 💾 БЭКАП

```bash
# Создать бэкап
cd /opt/antre-club
./scripts/backup.sh

# Автоматический бэкап (каждый день в 2:00)
crontab -e
# Добавить:
0 2 * * * cd /opt/antre-club && ./scripts/backup.sh
```

---

## 🛠️ ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Статус
docker compose ps

# Логи
docker compose logs -f backend
docker compose logs -f frontend

# Перезапуск
docker compose restart backend

# Остановка
docker compose down

# Запуск
docker compose up -d

# Использование ресурсов
docker stats
```

---

## 🐛 TROUBLESHOOTING

### Контейнер не запускается
```bash
docker compose logs backend
```

### Нет доступа к сайту
```bash
sudo netstat -tulpn | grep -E ':(80|443)'
docker compose logs nginx
```

### Мало памяти
```bash
free -h
# Создать swap:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📞 ПОЛНАЯ ДОКУМЕНТАЦИЯ

Смотри: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ✅ ЧЕКЛИСТ ДЕПЛОЯ

- [ ] Сервер обновлен
- [ ] Проект склонирован в `/opt/antre-club`
- [ ] `.env` создан и заполнен
- [ ] DNS настроен (A-запись)
- [ ] SSL сертификат получен и скопирован
- [ ] `./scripts/deploy.sh` выполнен
- [ ] Все контейнеры запущены (`docker compose ps`)
- [ ] Сайт доступен (https://your-domain.com)
- [ ] API работает (https://your-domain.com/api/health)
- [ ] Бот отвечает в Telegram
- [ ] Настроен автоматический бэкап

---

**Готово! 🎉**
