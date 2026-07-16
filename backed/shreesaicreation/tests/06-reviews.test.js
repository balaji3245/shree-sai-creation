import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  registerUser,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('Reviews — submit, moderate, list', function () {
  let adminToken;
  let product;

  before(async function () {
    adminToken = await adminLogin();
    product = await createPublishedProduct(adminToken, {
      name: 'Reviewable Chandelier',
      sku: `REV-${Date.now()}`,
      price: 12000,
      stock: 6,
    });
  });

  it('requires auth to submit a review', async function () {
    const res = await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .send({ rating: 5, body: 'Anonymous attempt' })
      .expect(401);
    expect(res.body.success).to.equal(false);
  });

  it('rejects invalid rating', async function () {
    const { token } = await registerUser();
    const res = await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .set(auth(token))
      .send({ rating: 6, body: 'Too high' })
      .expect(400);
    expect(res.body.success).to.equal(false);
  });

  it('submit → pending → approve → public list with stats', async function () {
    const { token } = await registerUser();

    const created = await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .set(auth(token))
      .send({ rating: 5, title: 'Great', body: 'Looks premium' })
      .expect(201);
    expect(created.body.review.status).to.equal('pending');

    const pendingPublic = await api()
      .get(`${BASE}/products/${product.slug}/reviews`)
      .expect(200);
    expect(pendingPublic.body.meta.total).to.equal(0);

    const adminPending = await api()
      .get(`${BASE}/admin/reviews?status=pending`)
      .set(auth(adminToken))
      .expect(200);
    expect(
      adminPending.body.reviews.some(
        (r) => String(r._id) === String(created.body.review._id)
      )
    ).to.equal(true);

    const moderated = await api()
      .patch(`${BASE}/admin/reviews/${created.body.review._id}`)
      .set(auth(adminToken))
      .send({ status: 'approved' })
      .expect(200);
    expect(moderated.body.review.status).to.equal('approved');

    const pub = await api()
      .get(`${BASE}/products/${product.slug}/reviews`)
      .expect(200);
    expect(pub.body.meta.total).to.equal(1);
    expect(pub.body.stats.averageRating).to.equal(5);
  });

  it('rejects duplicate review from same user', async function () {
    const { token } = await registerUser();
    await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .set(auth(token))
      .send({ rating: 4, body: 'Nice' })
      .expect(201);

    const dup = await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .set(auth(token))
      .send({ rating: 3, body: 'Again' })
      .expect(409);
    expect(dup.body.code).to.equal('CONFLICT');
  });

  it('rejected reviews stay hidden from public list', async function () {
    const { token } = await registerUser();
    const created = await api()
      .post(`${BASE}/products/${product.slug}/reviews`)
      .set(auth(token))
      .send({ rating: 1, title: 'Bad', body: 'Not for public' })
      .expect(201);

    await api()
      .patch(`${BASE}/admin/reviews/${created.body.review._id}`)
      .set(auth(adminToken))
      .send({ status: 'rejected', adminNote: 'spam' })
      .expect(200);

    const pub = await api()
      .get(`${BASE}/products/${product.slug}/reviews`)
      .expect(200);
    expect(
      pub.body.reviews.every(
        (r) => String(r._id) !== String(created.body.review._id)
      )
    ).to.equal(true);
  });
});
