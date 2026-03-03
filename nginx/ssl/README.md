# SSL Сертификаты для Antre Club Bot

## Вариант 1: Let's Encrypt (РЕКОМЕНДУЕТСЯ - БЕСПЛАТНО)

### Установка Certbot на сервере:
```bash
sudo apt update
sudo apt install -y certbot

# Получить сертификат
sudo certbot certonly --standalone -d your-domain.com

# Сертификаты будут в:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Скопировать в проект:
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

### Автообновление сертификата:
```bash
# Добавить в crontab
sudo crontab -e

# Добавить строку (обновление каждый день в 3:00):
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/*.pem /opt/antre-club/nginx/ssl/ && docker-compose -f /opt/antre-club/docker-compose.yml restart nginx
```

## Вариант 2: Самоподписанный сертификат (ТОЛЬКО ДЛЯ ТЕСТА!)

⚠️ **ВНИМАНИЕ:** Telegram MiniApp НЕ РАБОТАЕТ с самоподписанными сертификатами!
Используй только для локального тестирования.

```bash
# Создать самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./nginx/ssl/privkey.pem \
  -out ./nginx/ssl/fullchain.pem \
  -subj "/CN=your-domain.com"
```

## Проверка сертификатов:

```bash
# Проверить срок действия
openssl x509 -in ./nginx/ssl/fullchain.pem -noout -dates

# Проверить содержимое
openssl x509 -in ./nginx/ssl/fullchain.pem -noout -text
```

## После установки сертификатов:

```bash
# Перезапустить Nginx
docker-compose restart nginx

# Проверить логи
docker-compose logs nginx
```

## Troubleshooting:

### Ошибка "certificate not found":
- Убедись что файлы существуют: `ls -la ./nginx/ssl/`
- Проверь права: `chmod 644 ./nginx/ssl/*.pem`

### Ошибка "permission denied":
```bash
sudo chown $USER:$USER ./nginx/ssl/*.pem
chmod 644 ./nginx/ssl/*.pem
```

### Telegram не открывает MiniApp:
- Проверь что используешь НАСТОЯЩИЙ сертификат (Let's Encrypt)
- Проверь что домен правильно настроен в DNS
- Проверь что сертификат не истек
