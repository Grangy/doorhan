#!/bin/bash
# Полный деплой проекта со всеми файлами (node_modules, .next и т.д.)

set -e

SERVER="${DEPLOY_SERVER:-91.240.86.16}"
USER="${DEPLOY_USER:-root}"
PASSWORD="${DEPLOY_PASSWORD:-}"
DEPLOY_PATH="/var/www/doorhan-mega"

echo "🚀 Полный деплой проекта на сервер $SERVER"
echo "📦 Копирование ВСЕХ файлов включая node_modules и .next"
echo ""

# Создание архива со ВСЕМ
echo "📦 Создание полного архива проекта..."
cd "$(dirname "$0")/.."
tar -czf /tmp/doorhan-full-complete.tar.gz \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='node_modules/.cache' \
  --exclude='.next/cache' \
  . 2>&1 | tail -1

ARCHIVE_SIZE=$(du -h /tmp/doorhan-full-complete.tar.gz | awk '{print $1}')
echo "✅ Архив создан: $ARCHIVE_SIZE"
echo ""

# Копирование на сервер
echo "📤 Копирование архива на сервер (это может занять время)..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -o ConnectTimeout=300 /tmp/doorhan-full-complete.tar.gz root@$SERVER:/tmp/ 2>&1
echo "✅ Архив скопирован"
echo ""

# Остановка приложения
echo "⏸️  Остановка текущего приложения..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER "pm2 stop doorhan-mega 2>/dev/null || true"
echo "✅ Приложение остановлено"
echo ""

# Распаковка на сервере
echo "📦 Распаковка файлов на сервере..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
cd /var/www/doorhan-mega

# Создаем backup старой версии
if [ -d ".next" ]; then
    echo "💾 Создание backup..."
    tar -czf /tmp/doorhan-backup-$(date +%Y%m%d-%H%M%S).tar.gz .next node_modules package.json package-lock.json 2>/dev/null || true
    echo "✅ Backup создан"
fi

# Распаковка нового архива
echo "📦 Распаковка нового проекта..."
tar -xzf /tmp/doorhan-full-complete.tar.gz 2>&1 | grep -v 'LIBARCHIVE' | tail -1
rm -f /tmp/doorhan-full-complete.tar.gz

# Очистка временных файлов macOS
find . -name '._*' -type f -delete 2>/dev/null || true

echo "✅ Файлы распакованы"
ENDSSH

echo ""

# Проверка наличия файлов
echo "🔍 Проверка наличия файлов..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
cd /var/www/doorhan-mega

echo "Проверка node_modules:"
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules существует ($(du -sh node_modules | awk '{print $1}'))"
else
    echo "  ❌ node_modules отсутствует"
fi

echo "Проверка .next:"
if [ -d ".next" ]; then
    echo "  ✅ .next существует ($(du -sh .next | awk '{print $1}'))"
    if [ -f ".next/BUILD_ID" ]; then
        echo "  ✅ BUILD_ID найден"
    else
        echo "  ⚠️  BUILD_ID не найден"
    fi
else
    echo "  ❌ .next отсутствует"
fi

echo "Проверка package.json:"
if [ -f "package.json" ]; then
    echo "  ✅ package.json существует"
else
    echo "  ❌ package.json отсутствует"
fi
ENDSSH

echo ""

# Запуск приложения
echo "🚀 Запуск приложения..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
cd /var/www/doorhan-mega

# Если .next существует, просто запускаем
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Сборка найдена, запускаем приложение..."
    pm2 stop doorhan-mega 2>/dev/null || true
    sleep 2
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "⚠️  Сборка не найдена, запускаем сборку..."
    NODE_OPTIONS='--max-old-space-size=2048' npm run build 2>&1 | tail -5
    
    if [ -f ".next/BUILD_ID" ]; then
        echo "✅ Сборка завершена"
        pm2 start ecosystem.config.js
        sleep 5
    else
        echo "❌ Сборка не удалась"
        exit 1
    fi
fi

echo ""
echo "📊 Статус PM2:"
pm2 status doorhan-mega
echo ""
echo "🌐 Приложение должно быть доступно на: http://91.240.86.16:2231"
ENDSSH

# Очистка
rm -f /tmp/doorhan-full-complete.tar.gz

echo ""
echo "🎉🎉🎉 ПОЛНЫЙ ДЕПЛОЙ ЗАВЕРШЕН! 🎉🎉🎉"
echo ""

