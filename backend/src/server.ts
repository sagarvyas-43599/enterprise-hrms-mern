import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { startAttendanceCron } from './crons/attendance.cron';
import http from 'http';

const startServer = async () => {
  // Connect to DB
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`🚀 HRMS Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`🔗 Healthcheck available at: http://localhost:${env.PORT}/health`);
  });

  // Start Cron Jobs
  startAttendanceCron();

  // Graceful Shutdown Handling
  const handleShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Clean exit completed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Critical: Uncaught Exception detected in server process');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Critical: Unhandled Rejection detected in server process');
  process.exit(1);
});

startServer().catch((err) => {
  logger.fatal(`Server bootstrap failed: ${err.message}`);
  process.exit(1);
});
