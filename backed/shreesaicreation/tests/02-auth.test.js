import { expect } from 'chai';
import { api, BASE, adminLogin, registerUser, auth } from './helpers/api.js';

describe('Auth — Admin & Customer', function () {
  it('admin login succeeds with seeded credentials', async function () {
    const token = await adminLogin();
    expect(token).to.be.a('string').with.length.greaterThan(10);
  });

  it('admin login fails with wrong password', async function () {
    const res = await api()
      .post(`${BASE}/admin/auth/login`)
      .send({
        email: process.env.SEED_ADMIN_EMAIL || 'admin@test.com',
        password: 'WrongPass1',
      })
      .expect(401);
    expect(res.body.success).to.equal(false);
  });

  it('admin /me returns profile', async function () {
    const token = await adminLogin();
    const res = await api()
      .get(`${BASE}/admin/auth/me`)
      .set(auth(token))
      .expect(200);
    expect(res.body.admin.email).to.equal(
      process.env.SEED_ADMIN_EMAIL || 'admin@test.com'
    );
    expect(res.body.admin.role).to.equal('Admin');
  });

  it('customer can register and login', async function () {
    const { token, email } = await registerUser();
    expect(token).to.be.a('string');

    const login = await api()
      .post(`${BASE}/auth/login`)
      .send({ email, password: 'User@12345' })
      .expect(200);
    expect(login.body.token).to.be.a('string');
  });

  it('customer /me and profile update work', async function () {
    const { token } = await registerUser();
    const me = await api().get(`${BASE}/auth/me`).set(auth(token)).expect(200);
    expect(me.body.user.email).to.include('@test.com');

    const updated = await api()
      .patch(`${BASE}/auth/me`)
      .set(auth(token))
      .send({ name: 'Updated Name', phone: '9111111111' })
      .expect(200);
    expect(updated.body.user.name).to.equal('Updated Name');
  });

  it('duplicate email registration is rejected', async function () {
    const email = `dup_${Date.now()}@test.com`;
    await registerUser({ email });
    const res = await api()
      .post(`${BASE}/auth/register`)
      .send({ name: 'Dup', email, password: 'User@12345' })
      .expect(409);
    expect(res.body.success).to.equal(false);
  });
});
