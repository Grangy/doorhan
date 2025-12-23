#!/bin/bash
set -e

# Безопасный деплой с проверками и оптимизацией для серверов с ограниченной памятью

SERVER="${DEPLOY_SERVER:-91.240.86.16}"
USER="${DEPLOY_USER:-root}"
PASSWORD="${DEPLOY_PASSWORD:-}"
DEPLOY_PATH="/var/www/doorhan-mega"
BUILD_SCRIPT="${DEPLOY_PATH}/scripts/build-safe.sh"

echo "🚀 Безопасный деплой на сервер $SERVER"
echo ""

# Функция для выполнения команд на сервере
ssh_exec() {
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 root@$SERVER "$1"
}

# Функция для копирования файлов
scp_copy() {
    sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$1" root@$SERVER:"$2"
}

# Проверка доступности сервера
echo "🔍 Проверка доступности сервера..."
if ! ssh_exec "echo 'Сервер доступен'" > /dev/null 2>&1; then
    echo "❌ Сервер недоступен!"
    exit 1
fi
echo "✅ Сервер доступен"
echo ""

# Создание архива
echo "📦 Создание архива для деплоя..."
cd "$(dirname "$0")/.."
tar -czf /tmp/doorhan-deploy-safe.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='prisma/dev.db*' \
  --exclude='data/import/*.json' \
  --exclude='public/uploads/*' \
  --exclude='public/pdf/*.pdf' \
  app prisma scripts package.json package-lock.json tsconfig.json next.config.ts ecosystem.config.js .env.example .npmrc 2>&1 | tail -1
echo "✅ Архив создан"
echo ""

# Копирование архива на сервер
echo "📤 Копирование файлов на сервер..."
scp_copy "/tmp/doorhan-deploy-safe.tar.gz" "$DEPLOY_PATH/"
echo "✅ Файлы скопированы"
echo ""

# Распаковка на сервере
echo "📦 Распаковка файлов на сервере..."
ssh_exec "cd $DEPLOY_PATH && tar -xzf doorhan-deploy-safe.tar.gz && rm doorhan-deploy-safe.tar.gz && find . -name '._*' -type f -delete && chmod +x scripts/build-safe.sh 2>/dev/null || true"
echo "✅ Файлы распакованы"
echo ""

# Проверка свободного места
echo "💾 Проверка свободного места на сервере..."
ssh_exec "df -h $DEPLOY_PATH | tail -1 | awk '{print \"Свободно: \" \$4}'"
echo ""

# Проверка памяти
echo "🧠 Проверка памяти на сервере..."
ssh_exec "free -h | grep Mem | awk '{print \"Доступно памяти: \" \$7}'"
echo ""

# Установка зависимостей (если нужно)
echo "📦 Проверка зависимостей..."
if ssh_exec "cd $DEPLOY_PATH && [ ! -d node_modules ] || [ package.json -nt node_modules ]"; then
    echo "📦 Установка зависимостей..."
    ssh_exec "cd $DEPLOY_PATH && npm ci --prefer-offline --no-audit 2>&1 | tail -3"
    echo "✅ Зависимости установлены"
else
    echo "✅ Зависимости актуальны"
fi
echo ""

# Генерация Prisma Client
echo "🔧 Генерация Prisma Client..."
ssh_exec "cd $DEPLOY_PATH && npx prisma generate --schema=prisma/schema.prisma 2>&1 | tail -2"
echo "✅ Prisma Client сгенерирован"
echo ""

# Безопасная сборка
echo "🏗️  Запуск безопасной сборки..."
if ssh_exec "cd $DEPLOY_PATH && bash scripts/build-safe.sh"; then
    echo "✅ Сборка завершена успешно!"
else
    echo "❌ Сборка не удалась. Проверьте логи: $DEPLOY_PATH/logs/build.log"
    exit 1
fi
echo ""

# Перезапуск PM2
echo "🔄 Перезапуск приложения..."
ssh_exec "cd $DEPLOY_PATH && pm2 stop doorhan-mega 2>/dev/null || true"
sleep 2
ssh_exec "cd $DEPLOY_PATH && pm2 start ecosystem.config.js"
sleep 5
echo ""

# Проверка статуса
echo "📊 Статус приложения:"
ssh_exec "pm2 status doorhan-mega"
echo ""

# Проверка логов
echo "📋 Последние логи (первые 10 строк):"
ssh_exec "pm2 logs doorhan-mega --lines 10 --nostream" || true
echo ""

# Очистка
rm -f /tmp/doorhan-deploy-safe.tar.gz

echo "🎉🎉🎉 ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО! 🎉🎉🎉"
echo ""
echo "🌐 Приложение: http://$SERVER:2231"
echo ""
echo "✅ Оптимизации применены:"
echo "   ✓ Лимиты памяти для Node.js"
echo "   ✓ Отключен ESLint во время сборки"
echo "   ✓ Уменьшен параллелизм сборки"
echo "   ✓ Безопасная сборка с retry логикой"
echo "   ✓ Автоматический перезапуск PM2"
echo ""

