import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('Shipping zones — CRUD and quote matching', function () {
  let adminToken;
  let createdZoneId;
  let guestToken;

  before(async function () {
    adminToken = await adminLogin();
    const product = await createPublishedProduct(adminToken, {
      name: 'Ship Quote Fixture',
      sku: `SHP-${Date.now()}`,
      price: 5000,
      stock: 5,
    });
    const cart = await api()
      .post(`${BASE}/cart/items`)
      .send({
        productId: product._id,
        variantId: product.variants[0]._id,
        quantity: 1,
      })
      .expect(201);
    guestToken = cart.body.guestToken;
  });

  it('lists seeded shipping zones', async function () {
    const res = await api()
      .get(`${BASE}/admin/shipping/zones`)
      .set(auth(adminToken))
      .expect(200);
    expect(res.body.zones.length).to.be.greaterThan(0);
    expect(res.body.zones.some((z) => z.name.includes('Maharashtra'))).to.equal(
      true
    );
  });

  it('admin can create a shipping zone', async function () {
    const res = await api()
      .post(`${BASE}/admin/shipping/zones`)
      .set(auth(adminToken))
      .send({
        name: `South India ${Date.now()}`,
        states: ['karnataka', 'KA'],
        pinPrefixes: ['56'],
        methods: [{ name: 'Standard', amount: 129, code: 'standard' }],
      })
      .expect(201);
    expect(res.body.zone.methods[0].amountInPaise).to.equal(12900);
    createdZoneId = res.body.zone._id;
  });

  it('quotes shipping using pin-prefix zone match', async function () {
    const res = await api()
      .post(`${BASE}/shipping/quote`)
      .set('x-guest-token', guestToken)
      .send({ state: 'Karnataka', pincode: '560001' })
      .expect(200);
    expect(res.body.methods.length).to.be.greaterThan(0);
    expect(res.body.matchedZone.name).to.match(/South India/i);
    expect(res.body.methods.some((m) => m.amountInPaise === 12900)).to.equal(
      true
    );
  });

  it('quotes Maharashtra metro via seeded pin prefix', async function () {
    const res = await api()
      .post(`${BASE}/shipping/quote`)
      .set('x-guest-token', guestToken)
      .send({ state: 'Maharashtra', pincode: '400001' })
      .expect(200);
    expect(res.body.methods.length).to.be.greaterThan(0);
    expect(res.body.matchedZone.name).to.match(/Maharashtra/i);
    const amounts = res.body.methods.map((m) => m.amountInPaise);
    expect(amounts).to.include(9900);
  });

  it('admin can update a shipping zone', async function () {
    const res = await api()
      .patch(`${BASE}/admin/shipping/zones/${createdZoneId}`)
      .set(auth(adminToken))
      .send({
        methods: [
          { name: 'Express', amount: 199, code: 'express', estimatedDaysMax: 3 },
        ],
      })
      .expect(200);
    expect(res.body.zone.methods).to.have.length(1);
    expect(res.body.zone.methods[0].amountInPaise).to.equal(19900);
  });

  it('admin can soft-delete a shipping zone', async function () {
    const res = await api()
      .delete(`${BASE}/admin/shipping/zones/${createdZoneId}`)
      .set(auth(adminToken))
      .expect(200);
    expect(res.body.message).to.match(/deleted/i);

    const list = await api()
      .get(`${BASE}/admin/shipping/zones`)
      .set(auth(adminToken))
      .expect(200);
    expect(
      list.body.zones.every((z) => String(z._id) !== String(createdZoneId))
    ).to.equal(true);
  });

  it('rejects zone create without methods', async function () {
    const res = await api()
      .post(`${BASE}/admin/shipping/zones`)
      .set(auth(adminToken))
      .send({ name: 'Broken Zone', states: ['Goa'], methods: [] })
      .expect(400);
    expect(res.body.success).to.equal(false);
  });
});
