import mongoose from 'mongoose';
import { connectDatabase } from '../../src/config/database.js';
import { runAllSeeds } from '../../src/seed/run.seed.js';
import { createApp } from '../../src/app.js';
import { ADMIN_PERMISSIONS } from '../../src/constants/permissions.constants.js';
import adminRepository from '../../src/repositories/admin.repository.js';

export let app;

export async function resetDatabase() {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }
  await mongoose.connection.dropDatabase();
}

export async function seedMinimal() {
  await runAllSeeds();

  // Ensure admin exists even if seed skipped somehow
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@test.com';
  let admin = await adminRepository.findByEmail(email);
  if (!admin) {
    admin = await adminRepository.create({
      name: 'Test Admin',
      email,
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@Test123',
      role: 'Admin',
      permissions: [...ADMIN_PERMISSIONS],
    });
  }
  return admin;
}

export async function setupTestApp() {
  process.env.NODE_ENV = 'test';
  process.env.REDIS_ENABLED = 'false';
  process.env.RAZORPAY_MOCK = 'true';
  process.env.MAIL_MOCK = 'true';
  process.env.AUTO_SEED = 'false';
  process.env.HASH_KEY = process.env.HASH_KEY || 'ssc-test-hash-key';

  await resetDatabase();
  await seedMinimal();
  app = createApp({ quiet: true });
  return app;
}

export async function teardownTestApp() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
}
