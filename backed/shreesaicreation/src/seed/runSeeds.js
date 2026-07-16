import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import { runAllSeeds } from './run.seed.js';
import logger from '../utilities/logger.js';

dotenv.config();

async function main() {
  await connectDatabase();
  await runAllSeeds();
  logger.info('Seed complete');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
