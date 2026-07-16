import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  registerUser,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('CMS — Home, Pages, FAQ, Inquiries, Newsletter, Wishlist', function () {
  let adminToken;

  before(async function () {
    adminToken = await adminLogin();
  });

  it('GET /home returns seeded sections', async function () {
    const res = await api().get(`${BASE}/home`).expect(200);
    expect(res.body.sections).to.be.an('array').with.length.greaterThan(0);
    expect(res.body.featuredCategories).to.be.an('array');
    expect(res.body.sections.map((s) => s.sectionKey)).to.include('hero');
  });

  it('admin can create banner and it appears on home', async function () {
    await api()
      .post(`${BASE}/admin/banners`)
      .set(auth(adminToken))
      .send({
        title: 'Hero Light',
        subtitle: 'Luxury',
        imageDesktop: 'https://cdn.example.com/hero.jpg',
        placement: 'home_hero',
        ctaText: 'Shop',
        linkType: 'url',
        linkValue: '/shop',
      })
      .expect(201);

    const home = await api().get(`${BASE}/home`).expect(200);
    expect(home.body.banners.length).to.be.greaterThan(0);
  });

  it('lists and fetches CMS pages', async function () {
    const list = await api().get(`${BASE}/pages`).expect(200);
    expect(list.body.pages.some((p) => p.slug === 'about-us')).to.equal(true);

    const page = await api().get(`${BASE}/pages/about-us`).expect(200);
    expect(page.body.page.title).to.equal('About Us');
  });

  it('lists FAQs', async function () {
    const res = await api().get(`${BASE}/faqs`).expect(200);
    expect(res.body.faqs.length).to.be.greaterThan(0);
    expect(res.body.categories.length).to.be.greaterThan(0);
  });

  it('submits contact and custom design inquiry; admin can list', async function () {
    await api()
      .post(`${BASE}/contact`)
      .send({
        type: 'contact',
        name: 'Visitor',
        email: 'visitor@test.com',
        message: 'Hello support',
      })
      .expect(201);

    await api()
      .post(`${BASE}/inquiries`)
      .send({
        type: 'custom_design',
        name: 'Designer Client',
        email: 'custom@test.com',
        phone: '9000000000',
        message: 'Need custom dining chandelier',
        roomType: 'dining',
        budgetRange: '50k-1L',
      })
      .expect(201);

    const adminList = await api()
      .get(`${BASE}/admin/inquiries`)
      .set(auth(adminToken))
      .expect(200);
    expect(adminList.body.meta.total).to.be.greaterThan(0);
  });

  it('newsletter subscribe and unsubscribe', async function () {
    const email = `news_${Date.now()}@test.com`;
    const sub = await api()
      .post(`${BASE}/newsletter/subscribe`)
      .send({ email, name: 'Fan' })
      .expect(200);
    expect(sub.body.subscriber.isActive).to.equal(true);

    const unsub = await api()
      .post(`${BASE}/newsletter/unsubscribe`)
      .send({ email })
      .expect(200);
    expect(unsub.body.message).to.match(/Unsubscribed/i);
  });

  it('public store settings and admin settings update', async function () {
    const pub = await api().get(`${BASE}/store/settings`).expect(200);
    expect(pub.body.settings.storeName).to.be.a('string');

    const updated = await api()
      .patch(`${BASE}/admin/settings`)
      .set(auth(adminToken))
      .send({ whatsappNumber: '919999999999', tagline: 'Updated Tagline' })
      .expect(200);
    expect(updated.body.settings.whatsappNumber).to.equal('919999999999');
  });

  it('wishlist add / list / remove / move-to-cart', async function () {
    const product = await createPublishedProduct(adminToken, {
      name: 'Wishlist Light',
      sku: `WL-${Date.now()}`,
      price: 5000,
      stock: 4,
    });
    const { token } = await registerUser();

    const added = await api()
      .post(`${BASE}/wishlist/${product._id}`)
      .set(auth(token))
      .expect(200);
    expect(added.body.count).to.equal(1);

    const list = await api()
      .get(`${BASE}/wishlist`)
      .set(auth(token))
      .expect(200);
    expect(list.body.products[0]._id).to.equal(product._id);

    await api()
      .post(`${BASE}/wishlist/move-to-cart`)
      .set(auth(token))
      .send({
        productId: product._id,
        variantId: product.variants[0]._id,
        quantity: 1,
      })
      .expect(200);

    const after = await api()
      .get(`${BASE}/wishlist`)
      .set(auth(token))
      .expect(200);
    expect(after.body.count).to.equal(0);

    const cart = await api()
      .get(`${BASE}/cart`)
      .set(auth(token))
      .expect(200);
    expect(cart.body.cart.items.length).to.be.greaterThan(0);
  });
});
