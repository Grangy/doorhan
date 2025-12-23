#!/bin/bash
# Скрипт для настройки nginx и получения SSL сертификата для doorhan-crimea.com

set -e

SERVER="${DEPLOY_SERVER:-91.240.86.16}"
USER="${DEPLOY_USER:-root}"
PASSWORD="${DEPLOY_PASSWORD:-}"
DOMAIN="doorhan-crimea.com"
PORT="2231"
NGINX_CONFIG="/etc/nginx/sites-available/doorhan-crimea.com"
NGINX_ENABLED="/etc/nginx/sites-enabled/doorhan-crimea.com"

echo "🚀 Настройка nginx и SSL для домена $DOMAIN"
echo ""

# Шаг 1: Проверка и установка nginx
echo "📦 Шаг 1: Проверка nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
if ! command -v nginx &> /dev/null; then
    echo "Установка nginx..."
    apt-get update
    apt-get install -y nginx
    systemctl enable nginx
    echo "✅ nginx установлен"
else
    echo "✅ nginx уже установлен"
    nginx -v
fi
ENDSSH

echo ""

# Шаг 2: Создание конфигурации nginx
echo "📝 Шаг 2: Создание конфигурации nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << ENDSSH
cat > $NGINX_CONFIG << 'NGINXCONF'
# HTTP сервер - редирект на HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name doorhan-crimea.com;

    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Редирект на HTTPS (будет активен после получения сертификата)
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS сервер (будет активирован после получения сертификата)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name doorhan-crimea.com;

    # SSL сертификаты (будут добавлены certbot)
    # ssl_certificate /etc/letsencrypt/live/doorhan-crimea.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/doorhan-crimea.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Логи
    access_log /var/log/nginx/doorhan-crimea-access.log;
    error_log /var/log/nginx/doorhan-crimea-error.log;

    # Проксирование на Next.js
    location / {
        proxy_pass http://localhost:2231;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Оптимизация для статических файлов
    location /_next/static/ {
        proxy_pass http://localhost:2231;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Оптимизация для изображений
    location /images/ {
        proxy_pass http://localhost:2231;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Оптимизация для видео
    location /video/ {
        proxy_pass http://localhost:2231;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
NGINXCONF

echo "✅ Конфигурация создана"
ENDSSH

echo ""

# Шаг 3: Активация конфигурации (пока без SSL)
echo "🔗 Шаг 3: Активация конфигурации nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << ENDSSH
# Удаляем старую ссылку если есть
rm -f $NGINX_ENABLED

# Создаем временную конфигурацию только для HTTP (для получения сертификата)
cat > $NGINX_CONFIG << 'NGINXCONF'
# Временная конфигурация для получения SSL сертификата
server {
    listen 80;
    listen [::]:80;
    server_name doorhan-crimea.com;

    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Проксирование на Next.js (пока без HTTPS)
    location / {
        proxy_pass http://localhost:2231;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXCONF

# Создаем симлинк
ln -sf $NGINX_CONFIG $NGINX_ENABLED

# Проверка конфигурации
nginx -t

# Перезагрузка nginx
systemctl reload nginx

echo "✅ nginx настроен и перезагружен"
ENDSSH

echo ""

# Шаг 4: Установка certbot
echo "📦 Шаг 4: Установка certbot (Let's Encrypt)..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
if ! command -v certbot &> /dev/null; then
    echo "Установка certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo "✅ certbot установлен"
else
    echo "✅ certbot уже установлен"
    certbot --version
fi
ENDSSH

echo ""

# Шаг 5: Получение SSL сертификата
echo "🔐 Шаг 5: Получение SSL сертификата для $DOMAIN..."
echo "⚠️  ВАЖНО: Убедитесь, что домен $DOMAIN указывает на IP сервера $SERVER"
echo "   Проверьте DNS записи:"
echo "   A запись: $DOMAIN -> $SERVER"
echo ""
read -p "Продолжить получение сертификата? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Отменено. Настройте DNS и запустите скрипт снова."
    exit 1
fi

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << ENDSSH
# Получение сертификата
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

if [ \$? -eq 0 ]; then
    echo "✅ SSL сертификат получен успешно!"
else
    echo "❌ Ошибка при получении сертификата"
    echo "Проверьте:"
    echo "1. DNS записи настроены правильно"
    echo "2. Порт 80 открыт в firewall"
    echo "3. Домен доступен из интернета"
    exit 1
fi
ENDSSH

echo ""

# Шаг 6: Обновление конфигурации nginx с SSL
echo "🔧 Шаг 6: Обновление конфигурации nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
# Certbot автоматически обновит конфигурацию, но проверим
nginx -t
systemctl reload nginx
echo "✅ nginx обновлен с SSL"
ENDSSH

echo ""

# Шаг 7: Настройка автообновления сертификата
echo "🔄 Шаг 7: Настройка автообновления сертификата..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
# Проверяем наличие cron задачи
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    # Добавляем задачу на обновление (проверка дважды в день)
    (crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
    echo "✅ Автообновление сертификата настроено"
else
    echo "✅ Автообновление уже настроено"
fi
ENDSSH

echo ""

# Шаг 8: Проверка firewall
echo "🔥 Шаг 8: Проверка firewall..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << 'ENDSSH'
# Открываем порты 80 и 443
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
echo "✅ Порты 80 и 443 открыты в firewall"
ENDSSH

echo ""

# Финальная проверка
echo "✅ Финальная проверка..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER << ENDSSH
echo "Статус nginx:"
systemctl status nginx --no-pager | head -5

echo ""
echo "Статус сертификата:"
certbot certificates | grep -A 5 "$DOMAIN" || echo "Проверьте сертификат вручную"

echo ""
echo "Проверка портов:"
netstat -tuln | grep -E '80|443'
ENDSSH

echo ""
echo "🎉🎉🎉 НАСТРОЙКА ЗАВЕРШЕНА! 🎉🎉🎉"
echo ""
echo "✅ Что было сделано:"
echo "   1. Установлен и настроен nginx"
echo "   2. Создана конфигурация для $DOMAIN"
echo "   3. Настроено проксирование на порт $PORT"
echo "   4. Получен SSL сертификат от Let's Encrypt"
echo "   5. Настроено автообновление сертификата"
echo "   6. Открыты порты 80 и 443 в firewall"
echo ""
echo "🌐 Ваш сайт доступен:"
echo "   http://$DOMAIN (редирект на HTTPS)"
echo "   https://$DOMAIN"
echo ""
echo "📝 Полезные команды:"
echo "   - Проверка статуса: systemctl status nginx"
echo "   - Логи nginx: tail -f /var/log/nginx/doorhan-crimea-error.log"
echo "   - Обновление сертификата: certbot renew"
echo "   - Перезагрузка nginx: systemctl reload nginx"
echo ""

