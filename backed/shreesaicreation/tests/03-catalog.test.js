import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('Catalog — Categories, Products, Variants, Collections', function () {
  let adminToken;
  let categoryId;
  let product;

  before(async function () {
    adminToken = await adminLogin();
  });

  it('lists seeded public categories', async function () {
    const res = await api().get(`${BASE}/categories`).expect(200);
    expect(res.body.categories).to.be.an('array').with.length.greaterThan(0);
    expect(res.body.categories[0]).to.have.property('slug');
  });

  it('admin can create a category', async function () {
    const res = await api()
      .post(`${BASE}/admin/categories`)
      .set(auth(adminToken))
      .send({
        name: 'Crystal Chandeliers',
        shortDescription: 'Crystal collection',
        isFeatured: true,
      })
      .expect(201);
    expect(res.body.category.slug).to.equal('crystal-chandeliers');
    categoryId = res.body.category._id;
  });

  it('creates single-SKU product with auto Default variant', async function () {
    product = await createPublishedProduct(adminToken, {
      name: 'Aurora Pendant',
      sku: `AUR-${Date.now()}`,
      price: 25000,
      stock: 5,
      categoryIds: categoryId ? [categoryId] : [],
    });

    expect(product.variants).to.have.length(1);
    expect(product.variants[0].title).to.equal('Default');
    expect(product.variants[0].isDefault).to.equal(true);
    expect(product.hasOnlyDefaultVariant).to.equal(true);
    expect(product.variants[0].priceInPaise).to.equal(2500000);
  });

  it('public PLP and PDP work', async function () {
    const list = await api().get(`${BASE}/products`).expect(200);
    expect(list.body.products.length).to.be.greaterThan(0);

    const pdp = await api()
      .get(`${BASE}/products/${product.slug}`)
      .expect(200);
    expect(pdp.body.product.name).to.equal(product.name);
  });

  it('adds a second variant and blocks deleting the last one', async function () {
    const added = await api()
      .post(`${BASE}/admin/products/${product._id}/variants`)
      .set(auth(adminToken))
      .send({
        title: 'Gold / 8 Lights',
        sku: `AUR-G8-${Date.now()}`,
        price: 28000,
        stock: 3,
        options: { Finish: 'Gold' },
      })
      .expect(201);

    expect(added.body.product.variants.length).to.equal(2);
    expect(added.body.product.hasOnlyDefaultVariant).to.equal(false);

    const defaultVariant = added.body.product.variants.find(
      (v) => v.title === 'Default'
    );
    await api()
      .delete(
        `${BASE}/admin/products/${product._id}/variants/${defaultVariant._id}`
      )
      .set(auth(adminToken))
      .expect(200);

    const left = added.body.product.variants.find((v) => v.title !== 'Default');
    // re-fetch after first delete
    const afterDelete = await api()
      .get(`${BASE}/admin/products/${product._id}`)
      .set(auth(adminToken))
      .expect(200);
    const remainingId = afterDelete.body.product.variants[0]._id;

    const blocked = await api()
      .delete(
        `${BASE}/admin/products/${product._id}/variants/${remainingId}`
      )
      .set(auth(adminToken))
      .expect(409);
    expect(blocked.body.code).to.equal('CONFLICT');
  });

  it('creates and lists a collection', async function () {
    const res = await api()
      .post(`${BASE}/admin/collections`)
      .set(auth(adminToken))
      .send({
        name: 'Test Best Sellers',
        productIds: [product._id],
      })
      .expect(201);
    expect(res.body.collection.slug).to.equal('test-best-sellers');

    const pub = await api().get(`${BASE}/collections`).expect(200);
    expect(pub.body.collections.some((c) => c.slug === 'test-best-sellers')).to
      .equal(true);
  });

  it('product filters endpoint returns facets', async function () {
    const res = await api().get(`${BASE}/products/filters`).expect(200);
    expect(res.body.filters.productTypes).to.be.an('array');
    expect(res.body.filters.sorts).to.include('newest');
  });
});
