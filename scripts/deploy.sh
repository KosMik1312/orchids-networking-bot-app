#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ANTRE CLUB BOT - ПЕРВЫЙ ДЕПЛОЙ      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Проверка Docker
echo -e "${YELLOW}Проверка Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker не установлен!${NC}"
    echo "Установи Docker: https://docs.docker.com/engine/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker установлен: $(docker --version)${NC}"

# Проверка Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose не установлен!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose установлен${NC}"
echo ""

# Проверка .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ Файл .env не найден${NC}"
    echo -e "${BLUE}Создаю из шаблона...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Файл .env создан${NC}"
    echo ""
    echo -e "${RED}ВАЖНО! Отредактируй файл .env и заполни все переменные:${NC}"
    echo -e "  - DOMAIN (твой домен)"
    echo -e "  - BOT_TOKEN (от @BotFather)"
    echo -e "  - DB_PASSWORD (придумай сложный пароль)"
    echo -e "  - SECRET_KEY (сгенерируй: python -c 'import secrets; print(secrets.token_urlsafe(48))')"
    echo -e "  - ADMIN_IDS (твой Telegram ID)"
    echo -e "  - YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY"
    echo ""
    read -p "Нажми Enter после заполнения .env файла..."
fi

# Проверка обязательных переменных
echo -e "${YELLOW}Проверка переменных окружения...${NC}"
source .env

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "your-domain.com" ]; then
    echo -e "${RED}✗ DOMAIN не настроен в .env${NC}"
    exit 1
fi

if [ -z "$BOT_TOKEN" ] || [[ "$BOT_TOKEN" == *"your"* ]]; then
    echo -e "${RED}✗ BOT_TOKEN не настроен в .env${NC}"
    exit 1
fi

if [ -z "$DB_PASSWORD" ] || [[ "$DB_PASSWORD" == *"your"* ]]; then
    echo -e "${RED}✗ DB_PASSWORD не настроен в .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Переменные окружения настроены${NC}"
echo ""

# Проверка SSL сертификатов
echo -e "${YELLOW}Проверка SSL сертификатов...${NC}"
if [ ! -f nginx/ssl/fullchain.pem ] || [ ! -f nginx/ssl/privkey.pem ]; then
    echo -e "${RED}✗ SSL сертификаты не найдены!${NC}"
    echo ""
    echo -e "${BLUE}Для получения SSL сертификата:${NC}"
    echo "1. Убедись что домен $DOMAIN указывает на этот сервер"
    echo "2. Выполни: sudo certbot certonly --standalone -d $DOMAIN"
    echo "3. Скопируй сертификаты:"
    echo "   sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/"
    echo "   sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/"
    echo "   sudo chmod 644 ./nginx/ssl/*.pem"
    echo ""
    echo "Подробнее: nginx/ssl/README.md"
    echo ""
    read -p "Продолжить без SSL? (только для теста!) [y/N]: " continue_without_ssl
    if [ "$continue_without_ssl" != "y" ]; then
        exit 1
    fi
    echo -e "${YELLOW}⚠ Продолжаем без SSL (Telegram MiniApp не будет работать!)${NC}"
else
    echo -e "${GREEN}✓ SSL сертификаты найдены${NC}"
fi
echo ""

# Остановка старых контейнеров (если есть)
echo -e "${YELLOW}Остановка старых контейнеров...${NC}"
docker compose down 2>/dev/null
echo ""

# Запуск контейнеров
echo -e "${YELLOW}Запуск контейнеров...${NC}"
docker compose up -d

# Ожидание запуска
echo -e "${YELLOW}Ожидание запуска сервисов...${NC}"
sleep 10

# Проверка статуса
echo ""
echo -e "${BLUE}Статус контейнеров:${NC}"
docker compose ps

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ДЕПЛОЙ ЗАВЕРШЕН!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Проверь работу:${NC}"
echo -e "  Frontend: https://$DOMAIN"
echo -e "  Backend API: https://$DOMAIN/api/health"
echo -e "  Telegram Bot: отправь /start боту"
echo ""
echo -e "${BLUE}Полезные команды:${NC}"
echo -e "  Логи: docker compose logs -f"
echo -e "  Остановка: docker compose down"
echo -e "  Перезапуск: docker compose restart"
echo -e "  Обновление: ./scripts/update.sh"
echo ""
