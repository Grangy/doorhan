#!/bin/bash
# Скрипт для запуска сборки на сервере

SERVER="${DEPLOY_SERVER:-91.240.86.16}"
PASSWORD="${DEPLOY_PASSWORD:-}"
DEPLOY_PATH="/var/www/doorhan-mega"

echo "🚀 Запуск сборки на сервере $SERVER..."
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -t root@$SERVER << 'ENDSSH'
cd /var/www/doorhan-mega

echo "📊 Проверка текущего состояния..."
echo "Директория: $(pwd)"
echo "Свободно места: $(df -h . | tail -1 | awk '{print $4}')"
echo "Доступно памяти: $(free -h | grep Mem | awk '{print $7}')"
echo ""

# Проверка swap
if swapon --show | grep -q "/swapfile"; then
    echo "✅ Swap активен:"
    swapon --show
else
    echo "⚠️  Swap не настроен. Рекомендуется создать swap для стабильной сборки."
    echo "   Выполните: fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
fi
echo ""

# Проверка зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm ci --prefer-offline --no-audit
    echo "✅ Зависимости установлены"
else
    echo "✅ node_modules существует"
fi
echo ""

# Генерация Prisma
echo "🔧 Генерация Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma
echo "✅ Prisma Client сгенерирован"
echo ""

# Очистка старой сборки
echo "🧹 Очистка старой сборки..."
rm -rf .next
echo "✅ Очистка завершена"
echo ""

# Запуск сборки
echo "🏗️  Запуск сборки..."
echo "Это может занять несколько минут..."
echo ""

# Пробуем разные стратегии сборки
if NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1; then
    echo ""
    echo "✅ Сборка успешна!"
elif NODE_OPTIONS='--max-old-space-size=1536 --no-warnings' npm run build 2>&1; then
    echo ""
    echo "✅ Сборка успешна (с меньшим лимитом памяти)!"
elif NODE_OPTIONS='--max-old-space-size=1024 --no-warnings' npm run build 2>&1; then
    echo ""
    echo "✅ Сборка успешна (минимальный лимит памяти)!"
else
    echo ""
    echo "❌ Сборка не удалась. Проверьте логи выше."
    exit 1
fi

# Проверка результата
if [ -f ".next/BUILD_ID" ]; then
    echo ""
    echo "✅ BUILD_ID найден - сборка валидна"
    echo ""
    echo "🔄 Перезапуск приложения..."
    pm2 stop doorhan-mega 2>/dev/null || true
    sleep 2
    pm2 start ecosystem.config.js
    sleep 5
    echo ""
    echo "📊 Статус PM2:"
    pm2 status doorhan-mega
    echo ""
    echo "🌐 Приложение должно быть доступно на: http://91.240.86.16:2231"
else
    echo "❌ BUILD_ID не найден - сборка невалидна"
    exit 1
fi
ENDSSH

echo ""
echo "🎉 Готово!"

