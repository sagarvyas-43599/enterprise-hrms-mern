import mongoose from 'mongoose';
import dns from 'node:dns';
import { env } from './env.config';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Ensure DNS SRV records resolve smoothly on networks where default DNS rejects SRV lookups
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch {
      // Ignore if environment forbids custom DNS
    }

    mongoose.set('strictQuery', true);
    
    // Automatic compound and secondary index build tracking
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Attempting reconnection...');
    });

    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.NODE_ENV !== 'production', // Don't auto-build indexes in high-load production on startup
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // 15 seconds to allow cloud Atlas TLS handshake
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    logger.error(`Failed to initialize MongoDB connection: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully.');
  } catch (error) {
    logger.error(`Error during MongoDB disconnection: ${(error as Error).message}`);
  }
};
