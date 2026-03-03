#!/bin/bash

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ANTRE CLUB BOT - БЭКАП БД           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Создать директорию для бэкапов
mkdir -p ./backups

# Имя файла с датой
BACKUP_FILE="./backups/antre_club_$(date +%Y%m%d_%H%M%S).sql.gz"

echo -e "${YELLOW}Создание бэкапа базы данных...${NC}"

# Создать дамп БД
docker compose exec -T postgres pg_dump -U antre_user antre_club_db | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Бэкап создан: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
    
    # Удалить старые бэкапы (старше 30 дней)
    find ./backups -name "*.sql.gz" -mtime +30 -delete
    echo -e "${GREEN}✓ Старые бэкапы удалены (>30 дней)${NC}"
else
    echo -e "${RED}✗ Ошибка создания бэкапа${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Список бэкапов:${NC}"
ls -lh ./backups/*.sql.gz 2>/dev/null || echo "Нет бэкапов"

echo ""
echo -e "${BLUE}Восстановление из бэкапа:${NC}"
echo "  gunzip < $BACKUP_FILE | docker compose exec -T postgres psql -U antre_user antre_club_db"
echo ""
