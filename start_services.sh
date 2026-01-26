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
    echo -e "${YELLOW}0.${NC} Выход"
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
        0)
            echo -e "${BLUE}👋 До свидания!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Неверный выбор. Пожалуйста, выберите опцию 0-7${NC}"
            ;;
    esac
    
    read -p "Нажмите Enter для продолжения..." dummy
done