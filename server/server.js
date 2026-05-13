import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception - shutting down', { name: err?.name, message: err?.message });
  process.exit(1);
});

let server;

async function start() {
  await connectDB();

  server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });
}

async function shutdown(signal) {
  logger.warn(`Received ${signal} - shutting down gracefully`);

  // Stop accepting new connections first.
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    logger.info('HTTP server closed');
  }

  await disconnectDB();
  process.exit(0);
}

process.on('unhandledRejection', async (err) => {
  logger.error('Unhandled rejection - shutting down', { name: err?.name, message: err?.message });
  await shutdown('unhandledRejection');
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
  logger.error('Startup failed', { name: err?.name, message: err?.message });
  process.exit(1);
});
