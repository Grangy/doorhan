module.exports = {
  apps: [
    {
      name: 'doorhan-mega',
      script: 'npm',
      args: 'run start:prod',
      cwd: '/var/www/doorhan-mega',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 2231,
        // Оптимизация памяти для Node.js
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
      error_file: '/var/www/doorhan-mega/logs/error.log',
      out_file: '/var/www/doorhan-mega/logs/out.log',
      log_file: '/var/www/doorhan-mega/logs/combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      // Автоматический перезапуск при ошибках
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Логирование
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};

