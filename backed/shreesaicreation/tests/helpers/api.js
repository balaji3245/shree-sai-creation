import request from 'supertest';
import * as setup from './setup.js';

const BASE = '/api/v1';

export function api() {
  if (!setup.app) {
    throw new Error('Test app not initialized — mocha root hooks did not run');
  }
  return request(setup.app);
}

export async function adminLogin(
  email = process.env.SEED_ADMIN_EMAIL || 'admin@test.com',
  password = process.env.SEED_ADMIN_PASSWORD || 'Admin@Test123'
) {
  const res = await api()
    .post(`${BASE}/admin/auth/login`)
    .send({ email, password })
    .expect(200);

  return res.body.token;
}

export async function registerUser(overrides = {}) {
  const email = overrides.email || `user_${Date.now()}@test.com`;
  const res = await api()
    .post(`${BASE}/auth/register`)
    .send({
      name: overrides.name || 'Test User',
      email,
      password: overrides.password || 'User@12345',
      phone: overrides.phone || '9876543210',
    })
    .expect(201);

  return { token: res.body.token, user: res.body.user, email };
}

export async function createPublishedProduct(adminToken, overrides = {}) {
  const sku = overrides.sku || `SKU-${Date.now()}`;
  const res = await api()
    .post(`${BASE}/admin/products`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: overrides.name || 'Test Chandelier',
      sku,
      price: overrides.price ?? 10000,
      stock: overrides.stock ?? 10,
      status: 'published',
      productType: 'chandelier',
      shortDescription: 'Test product',
      dimmable: true,
      numberOfLights: 6,
      isFeatured: true,
      isBestSeller: true,
      ...overrides,
      sku,
    })
    .expect(201);

  return res.body.product;
}

export function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

export { BASE };
