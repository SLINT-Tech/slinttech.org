module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Azure App Service logging - use stdout/stderr
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
      // Disable PM2's log rotation on Azure
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production'
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'email-worker',
      script: 'dist/jobs/email.worker.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      // Azure App Service logging
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production'
      },
      // Graceful shutdown for worker
      kill_timeout: 10000,
      // Restart delay to prevent rapid restarts
      restart_delay: 5000
    }
  ]
};
