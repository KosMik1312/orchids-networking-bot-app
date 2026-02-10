#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd /opt/allora_bot/bot

# Активировать виртуальное окружение
source venv/bin/activate

# Параметры командной строки
FORCE=false
# Парсинг опций (например: ./start_services.sh --force)
while [[ $# -gt 0 ]]; do
    case "$1" in
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            echo -e "${YELLOW}⚠ Неизвестная опция: $1${NC}"
            exit 1
            ;;
    esac
done

# Файл логов для операций с БД
LOG_FILE="$PWD/db_cleanup.log"
# Флаг, чтобы пропустить паузу и сразу показать меню после операции
SKIP_PAUSE=false


# ============ ФУНКЦИИ ============

show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     УПРАВЛЕНИЕ СЕРВИСАМИ ORCHIDS       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo -e "${YELLOW}1.${NC} Проверка статуса процессов (Бот, FastAPI)"
    echo -e "${YELLOW}2.${NC} Остановить все процессы"
    echo -e "${YELLOW}3.${NC} Остановить выборочно (Бот/FastAPI)"
    echo -e "${YELLOW}4.${NC} Просмотр логов (Бот/FastAPI)"
    echo -e "${YELLOW}5.${NC} Запустить Бот и FastAPI последовательно"
    echo -e "${YELLOW}6.${NC} Запустить только FastAPI"
    echo -e "${YELLOW}7.${NC} Запустить только Бот"
    echo -e "${YELLOW}8.${NC} Очистить базу данных (ВНИМАНИЕ: удаляет все данные)"
    echo -e "${YELLOW}9.${NC} Настроить ADMIN_IDS (администраторы)"
    echo -e "${YELLOW}0.${NC} Выход"

    if [ "$FORCE" = "true" ]; then
        echo -e "${RED}* Режим FORCE: подтверждения отключены${NC}"
    fi

    echo ""
}

check_process() {
    local process_name=$1
    local process_pattern=$2
    
    if pgrep -f "$process_pattern" > /dev/null; then
        local pid=$(pgrep -f "$process_pattern")
        echo -e "${GREEN}✓${NC} $process_name запущен (PID: $pid)"
        return 0
    else
        echo -e "${RED}✗${NC} $process_name не запущен"
        return 1
    fi
}

check_status() {
    echo ""
    echo -e "${BLUE}📊 Статус процессов:${NC}"
    check_process "FastAPI (Uvicorn)" "uvicorn|api_server"
    check_process "Бот" "python.*start_all|bot\.py"
    echo ""
}

# Проверка валидности токена бота (простая) из config
check_bot_token() {
    BOT_TOKEN_VAL=$(python - <<PY
from config import BOT_TOKEN
print(BOT_TOKEN or "")
PY
)

    # Простая проверка: токен не пустой и не содержит плейсхолдер
    if [ -z "$BOT_TOKEN_VAL" ] || echo "$BOT_TOKEN_VAL" | grep -qi "your\|placeholder\|YOUR\|REPLACE\|BOT_TOKEN"; then
        echo -e "${RED}✗ BOT_TOKEN не задан или содержит плейсхолдер в .env. Бот не будет запущен.${NC}"
        echo -e "  Установите реальный токен в .env (BOT_TOKEN=...) и повторите запуск."
        return 1
    fi
    return 0
}

stop_all() {
    echo ""
    echo -e "${YELLOW}🛑 Остановка всех процессов...${NC}"
    
    if pgrep -f "uvicorn|api_server" > /dev/null; then
        pkill -f "uvicorn|api_server"
        echo -e "${GREEN}✓${NC} FastAPI остановлен"
        sleep 1
    fi
    
    if pgrep -f "python.*start_all|bot\.py" > /dev/null; then
        pkill -f "python.*start_all|bot\.py"
        echo -e "${GREEN}✓${NC} Бот остановлен"
        sleep 1
    fi
    
    echo -e "${GREEN}✅ Все процессы остановлены${NC}"
}

stop_selective() {
    echo ""
    echo -e "${BLUE}Выберите что остановить:${NC}"
    echo "1. Бот"
    echo "2. FastAPI"
    echo "0. Отмена"
    read -p "Выбор: " choice
    
    case $choice in
        1)
            if pgrep -f "python.*start_all|bot\.py" > /dev/null; then
                pkill -f "python.*start_all|bot\.py"
                echo -e "${GREEN}✓ Бот остановлен${NC}"
                sleep 1
            else
                echo -e "${RED}✗ Бот не запущен${NC}"
            fi
            ;;
        2)
            if pgrep -f "uvicorn|api_server" > /dev/null; then
                pkill -f "uvicorn|api_server"
                echo -e "${GREEN}✓ FastAPI остановлен${NC}"
                sleep 1
            else
                echo -e "${RED}✗ FastAPI не запущен${NC}"
            fi
            ;;
        0)
            echo "Отмена"
            ;;
        *)
            echo -e "${RED}Неверный выбор${NC}"
            ;;
    esac
}

view_logs() {
    echo ""
    echo -e "${BLUE}Выберите логи для просмотра:${NC}"
    echo "1. Логи Бота"
    echo "2. Логи FastAPI"
    echo "3. Оба лога одновременно (split)"
    echo "0. Отмена"
    read -p "Выбор: " choice
    
    case $choice in
        1)
            if [ -f bot.log ]; then
                echo -e "${BLUE}📋 Логи Бота (последние 50 строк, нажмите Ctrl+C для выхода):${NC}"
                tail -f bot.log
            else
                echo -e "${RED}✗ Файл bot.log не найден${NC}"
            fi
            ;;
        2)
            if [ -f api_server.log ]; then
                echo -e "${BLUE}📋 Логи FastAPI (последние 50 строк, нажмите Ctrl+C для выхода):${NC}"
                tail -f api_server.log
            else
                echo -e "${RED}✗ Файл api_server.log не найден${NC}"
            fi
            ;;
        3)
            if [ -f bot.log ] && [ -f api_server.log ]; then
                echo -e "${BLUE}📋 Оба лога (нажмите Ctrl+C для выхода):${NC}"
                # Использование split-экрана если доступен tmux, иначе просто выводим оба логи
                if command -v tmux &> /dev/null; then
                    tmux new-session -d -s logs
                    tmux send-keys -t logs "tail -f $PWD/bot.log" Enter
                    tmux split-window -h -t logs "tail -f $PWD/api_server.log"
                    tmux attach-session -t logs
                else
                    # Если tmux нет, выводим оба логи с меткой
                    (tail -f bot.log & tail -f api_server.log &) 2>/dev/null
                fi
            else
                echo -e "${RED}✗ Один или оба лога не найдены${NC}"
            fi
            ;;
        0)
            echo "Отмена"
            ;;
        *)
            echo -e "${RED}Неверный выбор${NC}"
            ;;
    esac
}

start_fastapi() {
    echo ""
    echo -e "${YELLOW}🚀 Запуск FastAPI (Uvicorn)...${NC}"
    
    if pgrep -f "uvicorn|api_server" > /dev/null; then
        echo -e "${YELLOW}⚠ FastAPI уже запущен${NC}"
        return
    fi
    
    nohup python api_server.py > api_server.log 2>&1 &
    FASTAPI_PID=$!
    disown $FASTAPI_PID
    
    sleep 2
    if pgrep -f "uvicorn|api_server" > /dev/null; then
        echo -e "${GREEN}✅ FastAPI запущен (PID: $FASTAPI_PID)${NC}"
        echo -e "${GREEN}   API доступен на http://localhost:8000${NC}"
    else
        echo -e "${RED}❌ Ошибка запуска FastAPI${NC}"
        tail -n 20 api_server.log
    fi
}

start_bot() {
    echo ""
    echo -e "${YELLOW}🤖 Запуск Бота...${NC}"
    
    if pgrep -f "python.*start_all|bot\.py" > /dev/null; then
        echo -e "${YELLOW}⚠ Бот уже запущен${NC}"
        return
    fi
    
    # Проверка токена перед запуском
    check_bot_token
    if [ $? -ne 0 ]; then
        return
    fi
    
    nohup python start_all.py > bot.log 2>&1 &
    BOT_PID=$!
    disown $BOT_PID
    
    sleep 2
    if pgrep -f "python.*start_all|bot\.py" > /dev/null; then
        echo -e "${GREEN}✅ Бот запущен (PID: $BOT_PID)${NC}"
    else
        echo -e "${RED}❌ Ошибка запуска Бота${NC}"
        tail -n 20 bot.log
    fi
}

start_both() {
    echo ""
    echo -e "${YELLOW}🚀 Запуск FastAPI и Бота...${NC}"
    
    start_fastapi
    sleep 2
    start_bot
    
    echo ""
    echo -e "${GREEN}✅ Сервисы готовы${NC}"
    check_status
}

clear_database() {
    echo ""
    # Линейка лога: START
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] START clear_database FORCE=$FORCE USER=${USER:-$(whoami)}" >> "$LOG_FILE"

    echo -e "${RED}⚠ ВНИМАНИЕ!${NC} Эта операция удалит ВСЕ данные из базы данных."
    if [ "$FORCE" = "true" ]; then
        echo -e "${YELLOW}--force задано: пропускаю подтверждение${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] --force задано: подтверждение пропущено" >> "$LOG_FILE"
    else
        read -p "Введите 'YES' для подтверждения: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Операция отменена."
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] CANCELLED by user" >> "$LOG_FILE"
            return
        fi
    fi

    echo -e "${YELLOW}🛑 Останавливаю сервисы перед очисткой...${NC}"
    stop_all

    # Определяем тип БД и делаем резервную копию
    DB_URL=$(python - <<PY
from config import DATABASE_URL
print(DATABASE_URL or "")
PY
)

    DB_SCHEME=$(echo "$DB_URL" | awk -F: '{print $1}')

    if [ "$DB_SCHEME" = "sqlite+aiosqlite" ] || [ "$DB_SCHEME" = "sqlite" ]; then
        # SQLite: делаем копию файла
        DB_PATH=$(python - <<PY
import os
from config import DATABASE_NAME
print(os.path.abspath(DATABASE_NAME))
PY
)

        if [ -z "$DB_PATH" ]; then
            echo -e "${RED}✗ Не удалось определить путь к SQLite базе данных${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: SQLite DB path not found" >> "$LOG_FILE"
            SKIP_PAUSE=true
            return
        fi

        if [ -f "$DB_PATH" ]; then
            BACKUP="${DB_PATH}.backup.$(date +%Y%m%d%H%M%S)"
            cp "$DB_PATH" "$BACKUP"
            echo -e "${GREEN}✓ Бэкап SQLite базы создан: $BACKUP${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] BACKUP created: $BACKUP" >> "$LOG_FILE"
        else
            echo -e "${YELLOW}⚠ Файл SQLite БД не найден по пути: $DB_PATH${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: SQLite DB file not found at $DB_PATH" >> "$LOG_FILE"
        fi

    elif [ "$DB_SCHEME" = "postgresql+asyncpg" ] || [ "$DB_SCHEME" = "postgresql" ]; then
        # PostgreSQL: делаем дамп через pg_dump (если доступен)
        BACKUP_FILE="$PWD/postgres_backup_$(date +%Y%m%d%H%M%S).sql.gz"
        if command -v pg_dump > /dev/null 2>&1; then
            echo -e "${YELLOW}⤓ Создаю дамп PostgreSQL: $BACKUP_FILE${NC}"
            # Используем connection string из config.py
            echo "$DB_URL" | grep -q @ || true
            # pg_dump поддерживает строку подключения через --dbname
            pg_dump --dbname="$DB_URL" | gzip > "$BACKUP_FILE" 2>> "$LOG_FILE"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Дамп PostgreSQL создан: $BACKUP_FILE${NC}"
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] BACKUP created: $BACKUP_FILE" >> "$LOG_FILE"
            else
                echo -e "${RED}✗ Ошибка при создании дампа PostgreSQL${NC}"
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: pg_dump failed" >> "$LOG_FILE"
            fi
        else
            echo -e "${YELLOW}⚠ pg_dump не найден. Пропускаю создание дампа.${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: pg_dump not found" >> "$LOG_FILE"
        fi

    else
        echo -e "${YELLOW}⚠ Неизвестный тип БД (не SQLite и не PostgreSQL). Попытка продолжить...${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Unknown DB scheme: $DB_SCHEME" >> "$LOG_FILE"
    fi

    echo -e "${YELLOW}🧹 Очищаю структуру базы (drop/create)...${NC}"
    python - <<PY
import asyncio
import sys
import signal
from db.session import get_async_engine
from db.models import Base

# Обработка сигнала прерывания для чистого выхода
def handle_sigint(signum, frame):
    print("Операция прервана пользователем (SIGINT)")
    sys.exit(1)

signal.signal(signal.SIGINT, handle_sigint)

async def run():
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

try:
    asyncio.run(run())
    print("✅ Очистка и инициализация БД завершены")
    sys.exit(0)
except KeyboardInterrupt:
    print("Операция прервана пользователем (KeyboardInterrupt)")
    sys.exit(1)
except Exception as e:
    print(f"Ошибка при очистке БД: {e}")
    sys.exit(1)
PY

    PY_EXIT=$?
    if [ $PY_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ База данных очищена${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: DB cleared" >> "$LOG_FILE"
    else
        echo -e "${RED}✗ Ошибка при очистке БД (код: $PY_EXIT)${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: DB cleanup failed (exit $PY_EXIT)" >> "$LOG_FILE"
    fi

    # После операции возвращаемся в меню без паузы
    SKIP_PAUSE=true
}


configure_admin_ids() {
    echo ""
    ENV_FILE="$PWD/.env"

    # Показываем текущее значение
    if [ -f "$ENV_FILE" ]; then
        CURRENT=$(grep -E "^ADMIN_IDS=" "$ENV_FILE" | tail -1 | cut -d'=' -f2-)
        if [ -n "$CURRENT" ]; then
            echo -e "${BLUE}Текущие ADMIN_IDS: ${GREEN}$CURRENT${NC}"
        else
            echo -e "${YELLOW}ADMIN_IDS не задан${NC}"
        fi
    else
        echo -e "${YELLOW}Файл .env не найден, будет создан${NC}"
    fi

    echo ""
    echo -e "Введите Telegram ID администраторов через запятую (без пробелов)."
    echo -e "Пример: ${GREEN}123456789,987654321${NC}"
    echo -e "Оставьте пустым и нажмите Enter, чтобы очистить список."
    read -p "ADMIN_IDS: " NEW_IDS

    # Валидация: только цифры и запятые
    CLEAN_IDS=$(echo "$NEW_IDS" | tr -d ' ' | sed 's/,\+/,/g' | sed 's/^,//' | sed 's/,$//')

    if [ -n "$CLEAN_IDS" ]; then
        if ! echo "$CLEAN_IDS" | grep -qE '^[0-9]+(,[0-9]+)*$'; then
            echo -e "${RED}❌ Неверный формат. Используйте только числа через запятую.${NC}"
            return
        fi
    fi

    # Создаём .env если не существует
    if [ ! -f "$ENV_FILE" ]; then
        touch "$ENV_FILE"
        echo -e "${GREEN}✓ Создан файл .env${NC}"
    fi

    # Заменяем или добавляем ADMIN_IDS
    if grep -qE "^ADMIN_IDS=" "$ENV_FILE"; then
        # Заменяем все вхождения ADMIN_IDS
        sed -i "s/^ADMIN_IDS=.*/ADMIN_IDS=$CLEAN_IDS/" "$ENV_FILE"
    else
        echo "ADMIN_IDS=$CLEAN_IDS" >> "$ENV_FILE"
    fi

    echo -e "${GREEN}✅ ADMIN_IDS обновлён: ${CLEAN_IDS:-<пусто>}${NC}"

    # Предлагаем перезапуск
    echo ""
    read -p "Перезапустить сервисы для применения? (y/n): " RESTART
    if [ "$RESTART" = "y" ] || [ "$RESTART" = "Y" ]; then
        stop_all
        sleep 1
        start_both
    fi

    SKIP_PAUSE=true
}


# ============ ОСНОВНОЙ ЦИКЛ ============

while true; do
    show_menu
    read -p "Выбор: " choice
    
    case $choice in
        1)
            check_status
            ;;
        2)
            stop_all
            ;;
        3)
            stop_selective
            ;;
        4)
            view_logs
            ;;
        5)
            start_both
            ;;
        6)
            start_fastapi
            ;;
        7)
            start_bot
            ;;
        8)
            clear_database
            ;;
        9)
            configure_admin_ids
            ;;
        0)
            echo -e "${BLUE}👋 До свидания!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Неверный выбор. Пожалуйста, выберите опцию 0-9${NC}"
            ;;
    esac
    
    if [ "$SKIP_PAUSE" = "true" ]; then
        SKIP_PAUSE=false
        continue
    fi

    read -p "Нажмите Enter для продолжения..." dummy
done