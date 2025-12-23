#!/bin/bash
# Быстрая настройка swap на сервере

SERVER="${DEPLOY_SERVER:-91.240.86.16}"
PASSWORD="${DEPLOY_PASSWORD:-}"
SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

echo "🔧 Настройка swap на сервере $SERVER..."

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

# Проверка существующего swap
if swapon --show | grep -q "$SWAP_FILE"; then
    echo "✅ Swap уже существует:"
    swapon --show
    exit 0
fi

echo "📦 Создание swap файла ${SWAP_SIZE}..."
if [ -f "$SWAP_FILE" ]; then
    swapoff "$SWAP_FILE" 2>/dev/null || true
    rm -f "$SWAP_FILE"
fi

# Создаем swap
fallocate -l "$SWAP_SIZE" "$SWAP_FILE" 2>/dev/null || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=2048
chmod 600 "$SWAP_FILE"
mkswap "$SWAP_FILE"
swapon "$SWAP_FILE"

# Добавляем в fstab
if ! grep -q "$SWAP_FILE" /etc/fstab; then
    echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
fi

# Настройка swappiness
sysctl vm.swappiness=10
if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
    echo "vm.swappiness=10" >> /etc/sysctl.conf
fi

echo "✅ Swap настроен!"
echo ""
echo "📊 Информация о памяти:"
free -h
ENDSSH

echo ""
echo "🎉 Настройка swap завершена!"

