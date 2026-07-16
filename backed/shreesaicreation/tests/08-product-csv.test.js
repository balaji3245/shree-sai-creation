import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('Product CSV — export, import, related products', function () {
  let adminToken;
  let product;

  before(async function () {
    adminToken = await adminLogin();
    product = await createPublishedProduct(adminToken, {
      name: 'CSV Fixture Chandelier',
      sku: `CSV-${Date.now()}`,
      price: 11000,
      stock: 4,
    });
  });

  it('exports products CSV', async function () {
    const res = await api()
      .get(`${BASE}/admin/products/export`)
      .set(auth(adminToken))
      .expect(200);
    expect(res.headers['content-type']).to.match(/csv/);
    expect(res.text).to.include('name,slug,sku');
    expect(res.text).to.include(product.slug);
  });

  it('imports products CSV (create + update)', async function () {
    const sku = `IMP-${Date.now()}`;
    const slug = `imported-light-${Date.now()}`;
    const csv = [
      'name,slug,sku,price,stock,status,productType',
      `Imported Light,${slug},${sku},9999,3,published,pendant`,
    ].join('\n');

    const res = await api()
      .post(`${BASE}/admin/products/import`)
      .set(auth(adminToken))
      .attach('file', Buffer.from(csv), 'products.csv')
      .expect(200);

    expect(res.body.created).to.equal(1);
    expect(res.body.errors).to.have.length(0);

    const csv2 = [
      'name,slug,sku,price,stock,status,productType',
      `Imported Light Updated,,${sku},10999,5,published,pendant`,
    ].join('\n');

    const updated = await api()
      .post(`${BASE}/admin/products/import`)
      .set(auth(adminToken))
      .attach('file', Buffer.from(csv2), 'products.csv')
      .expect(200);
    expect(updated.body.updated).to.equal(1);

    const pdp = await api().get(`${BASE}/products/${slug}`).expect(200);
    expect(pdp.body.product.variants[0].stock).to.equal(5);
    expect(pdp.body.product.variants[0].priceInPaise).to.equal(1099900);
  });

  it('rejects import without CSV payload', async function () {
    const res = await api()
      .post(`${BASE}/admin/products/import`)
      .set(auth(adminToken))
      .expect(400);
    expect(res.body.success).to.equal(false);
  });

  it('sets and clears related products', async function () {
    const other = await createPublishedProduct(adminToken, {
      name: 'Related Piece',
      sku: `REL-${Date.now()}`,
      price: 8000,
      stock: 2,
    });

    const set = await api()
      .patch(`${BASE}/admin/products/${product._id}/related`)
      .set(auth(adminToken))
      .send({ relatedProductIds: [other._id] })
      .expect(200);

    expect(set.body.product.relatedProductIds.map(String)).to.include(
      String(other._id)
    );

    const cleared = await api()
      .patch(`${BASE}/admin/products/${product._id}/related`)
      .set(auth(adminToken))
      .send({ relatedProductIds: [] })
      .expect(200);
    expect(cleared.body.product.relatedProductIds).to.have.length(0);
  });

  it('returns / RMA routes remain deferred', async function () {
    const res = await api()
      .get(`${BASE}/admin/returns`)
      .set(auth(adminToken))
      .expect(404);
    expect(res.body.message).to.match(/not found/i);
  });
});
