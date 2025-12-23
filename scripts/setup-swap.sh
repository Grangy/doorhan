#!/bin/bash
set -e

# Скрипт для создания swap на сервере для стабильной сборки

SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

echo "🔧 Настройка swap на сервере..."
echo ""

# Проверка существующего swap
if swapon --show | grep -q "$SWAP_FILE"; then
    echo "✅ Swap уже существует:"
    swapon --show
    echo ""
    echo "💡 Если нужно пересоздать, выполните:"
    echo "   swapoff $SWAP_FILE"
    echo "   rm $SWAP_FILE"
    echo "   Затем запустите этот скрипт снова"
    exit 0
fi

# Проверка свободного места
echo "💾 Проверка свободного места на диске..."
FREE_SPACE=$(df -BG / | tail -1 | awk '{print $4}' | sed 's/G//')
echo "Свободно: ${FREE_SPACE}G"
echo ""

if [ "$FREE_SPACE" -lt 3 ]; then
    echo "⚠️  ВНИМАНИЕ: Мало свободного места (${FREE_SPACE}G). Рекомендуется минимум 3G"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Создание swap файла
echo "📦 Создание swap файла ${SWAP_SIZE}..."
if [ -f "$SWAP_FILE" ]; then
    echo "⚠️  Файл $SWAP_FILE уже существует. Удаляем..."
    swapoff "$SWAP_FILE" 2>/dev/null || true
    rm -f "$SWAP_FILE"
fi

# Создаем swap файл
fallocate -l "$SWAP_SIZE" "$SWAP_FILE" || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=2048
chmod 600 "$SWAP_FILE"

# Форматируем как swap
mkswap "$SWAP_FILE"

# Активируем swap
swapon "$SWAP_FILE"

# Проверяем
echo ""
echo "✅ Swap создан и активирован:"
swapon --show
echo ""

# Добавляем в fstab для автозагрузки
if ! grep -q "$SWAP_FILE" /etc/fstab; then
    echo "📝 Добавление в /etc/fstab для автозагрузки..."
    echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
    echo "✅ Добавлено в /etc/fstab"
else
    echo "✅ Уже есть в /etc/fstab"
fi

# Показываем общую информацию
echo ""
echo "📊 Информация о памяти:"
free -h
echo ""

# Настройка swappiness (оптимизация использования swap)
echo "⚙️  Настройка swappiness..."
CURRENT_SWAPPINESS=$(cat /proc/sys/vm/swappiness 2>/dev/null || echo "60")
echo "Текущий swappiness: $CURRENT_SWAPPINESS"

# Устанавливаем оптимальное значение (10 - меньше использует swap, 60 - по умолчанию)
if [ "$CURRENT_SWAPPINESS" != "10" ]; then
    echo "Установка swappiness=10 (рекомендуется для серверов)..."
    sysctl vm.swappiness=10
    
    # Добавляем в sysctl.conf для постоянства
    if ! grep -q "vm.swappiness" /etc/sysctl.conf; then
        echo "vm.swappiness=10" >> /etc/sysctl.conf
        echo "✅ Добавлено в /etc/sysctl.conf"
    fi
else
    echo "✅ Swappiness уже оптимален"
fi

echo ""
echo "🎉 Настройка swap завершена!"
echo ""
echo "📊 Итоговая информация:"
echo "   Swap файл: $SWAP_FILE"
echo "   Размер: $SWAP_SIZE"
echo "   Статус: активен"
echo "   Автозагрузка: включена"
echo ""

