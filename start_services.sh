#!/bin/bash
cd /opt/allora_bot/bot

# Активировать виртуальное окружение
source venv/bin/activate

# Запустить туннель в фоне и сохранить его адрес (nohup чтобы работал после отключения SSH)
echo "🌐 Запуск туннеля..."
nohup lt --port 8000 > tunnel.log 2>&1 &
TUNNEL_PID=$!
disown $TUNNEL_PID

# Дождаться инициализации туннеля и вывести адрес
sleep 3
if [ -f tunnel.log ]; then
    TUNNEL_URL=$(grep -oP 'https?://[^\s]+' tunnel.log | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        echo "🔗 Туннель запущен: $TUNNEL_URL"
    fi
fi

# Запустить бота в фоне (nohup чтобы работал после отключения SSH)
echo "🤖 Запуск бота..."
nohup python start_all.py > bot.log 2>&1 &
BOT_PID=$!
disown $BOT_PID

echo "✅ Бот и туннель запущены"
echo "📋 Логи туннеля: tail -f tunnel.log"
echo "📋 Логи бота: tail -f bot.log"
echo "🛑 Остановить: kill $TUNNEL_PID $BOT_PID"