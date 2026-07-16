import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupTestApp, teardownTestApp } from './helpers/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.test'), override: true });

/** Mocha root hook plugin — loaded via --require */
export const mochaHooks = {
  async beforeAll() {
    this.timeout(60000);
    await setupTestApp();
  },
  async afterAll() {
    this.timeout(30000);
    await teardownTestApp();
  },
};
