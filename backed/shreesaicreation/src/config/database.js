import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utilities/logger.js';

dotenv.config();

export async function connectDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  logger.info(`Successfully connected to the ${process.env.DATABASE || 'mongo'} database`);
  return mongoose.connection;
}

export default mongoose;
