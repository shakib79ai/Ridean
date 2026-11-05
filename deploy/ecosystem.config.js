// PM2 process file for a single VPS.  pm2 start deploy/ecosystem.config.js && pm2 save
const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    { name: 'ridean-api', cwd: path.join(root, 'apps/api'), script: 'dist/main.js', env: { NODE_ENV: 'production' } },
    { name: 'ridean-website', cwd: path.join(root, 'apps/website/.next/standalone/apps/website'), script: 'server.js', env: { NODE_ENV: 'production', PORT: 3000, HOSTNAME: '127.0.0.1' } },
    { name: 'ridean-pwa', cwd: path.join(root, 'apps/pwa/.next/standalone/apps/pwa'), script: 'server.js', env: { NODE_ENV: 'production', PORT: 3001, HOSTNAME: '127.0.0.1' } },
    { name: 'ridean-admin', cwd: path.join(root, 'apps/admin/.next/standalone/apps/admin'), script: 'server.js', env: { NODE_ENV: 'production', PORT: 3002, HOSTNAME: '127.0.0.1' } },
  ],
};
