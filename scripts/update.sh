#!/bin/bash

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ANTRE CLUB BOT - ОБНОВЛЕНИЕ КОДА    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Проверка Git
if [ -d .git ]; then
    echo -e "${YELLOW}Обновление из Git...${NC}"
    git pull
    echo -e "${GREEN}✓ Код обновлен${NC}"
else
    echo -e "${YELLOW}⚠ Git репозиторий не найден${NC}"
    echo "Обнови файлы вручную по FTP"
fi
echo ""

# Перезапуск сервисов
echo -e "${YELLOW}Перезапуск сервисов...${NC}"

read -p "Перезапустить Backend? [Y/n]: " restart_backend
if [ "$restart_backend" != "n" ]; then
    docker compose restart backend
    echo -e "${GREEN}✓ Backend перезапущен${NC}"
fi

read -p "Перезапустить Frontend? [Y/n]: " restart_frontend
if [ "$restart_frontend" != "n" ]; then
    docker compose restart frontend
    echo -e "${GREEN}✓ Frontend перезапущен${NC}"
fi

echo ""
echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo ""
echo -e "${BLUE}Проверь логи:${NC}"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo ""
