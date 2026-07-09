require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config/env');
const prisma = require('./src/lib/prisma');

// Bind to the port Render assigns (never hardcode) and to 0.0.0.0 so the
// container is reachable.
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`API listening on port ${config.port} [${config.nodeEnv}]`);
});

// Graceful shutdown so Render deploys/restarts don't drop DB connections.
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
