import { expect } from 'chai';
import {
  api,
  BASE,
  adminLogin,
  registerUser,
  auth,
  createPublishedProduct,
} from './helpers/api.js';

describe('Commerce — Cart, Coupons, Checkout, Orders', function () {
  let adminToken;
  let product;
  let variantId;
  let guestToken;

  before(async function () {
    adminToken = await adminLogin();
    product = await createPublishedProduct(adminToken, {
      name: 'Checkout Chandelier',
      sku: `CHK-${Date.now()}`,
      price: 15000,
      stock: 8,
    });
    variantId = product.variants[0]._id;
  });

  it('guest cart requires variantId', async function () {
    const bad = await api()
      .post(`${BASE}/cart/items`)
      .send({ productId: product._id, quantity: 1 })
      .expect(400);
    expect(bad.body.success).to.equal(false);

    const ok = await api()
      .post(`${BASE}/cart/items`)
      .send({ productId: product._id, variantId, quantity: 2 })
      .expect(201);
    expect(ok.body.cart.items).to.have.length(1);
    expect(ok.body.guestToken).to.match(/^gst_/);
    guestToken = ok.body.guestToken;
    expect(ok.body.summary.itemCount).to.equal(2);
  });

  it('updates cart item quantity and summary', async function () {
    const cart = await api()
      .get(`${BASE}/cart`)
      .set('x-guest-token', guestToken)
      .expect(200);
    const itemId = cart.body.cart.items[0]._id;

    const updated = await api()
      .patch(`${BASE}/cart/items/${itemId}`)
      .set('x-guest-token', guestToken)
      .send({ quantity: 1 })
      .expect(200);
    expect(updated.body.cart.items[0].quantity).to.equal(1);
  });

  it('creates coupon, applies, and validates discount', async function () {
    await api()
      .post(`${BASE}/admin/coupons`)
      .set(auth(adminToken))
      .send({
        code: 'LIGHT10',
        discountType: 'percentage',
        discountValue: 10,
        minCart: 1000,
      })
      .expect(201);

    const applied = await api()
      .post(`${BASE}/cart/coupon`)
      .set('x-guest-token', guestToken)
      .send({ code: 'LIGHT10' })
      .expect(200);

    expect(applied.body.summary.discountInPaise).to.be.greaterThan(0);
    expect(applied.body.summary.couponCode).to.equal('LIGHT10');
  });

  it('quotes shipping for an address', async function () {
    const res = await api()
      .post(`${BASE}/shipping/quote`)
      .set('x-guest-token', guestToken)
      .send({ state: 'Maharashtra', pincode: '400001' })
      .expect(200);
    expect(res.body.methods).to.be.an('array').with.length.greaterThan(0);
  });

  it('checkout create + mock confirm marks order paid and decrements stock', async function () {
    const stockBefore = product.variants[0].stock;

    const created = await api()
      .post(`${BASE}/checkout/create-order`)
      .set('x-guest-token', guestToken)
      .send({
        email: 'buyer@test.com',
        shippingAddress: {
          fullName: 'Buyer Test',
          phone: '9999999999',
          email: 'buyer@test.com',
          line1: '12 Light Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
      })
      .expect(201);

    expect(created.body.order.status).to.equal('pending_payment');
    expect(created.body.razorpay.mock).to.equal(true);
    const { orderNumber } = created.body.order;
    const rzOrderId = created.body.razorpay.orderId;

    const confirmed = await api()
      .post(`${BASE}/checkout/confirm`)
      .send({
        orderNumber,
        razorpay_order_id: rzOrderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      })
      .expect(200);

    expect(confirmed.body.order.status).to.equal('paid');
    expect(confirmed.body.order.inventoryDecremented).to.equal(true);
    expect(confirmed.body.order.invoiceUrl).to.include('/uploads/invoices/');

    // Idempotent confirm
    const again = await api()
      .post(`${BASE}/checkout/confirm`)
      .send({
        orderNumber,
        razorpay_order_id: rzOrderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      })
      .expect(200);
    expect(again.body.alreadyPaid).to.equal(true);

    const refreshed = await api()
      .get(`${BASE}/admin/products/${product._id}`)
      .set(auth(adminToken))
      .expect(200);
    const v = refreshed.body.product.variants.find(
      (x) => String(x._id) === String(variantId)
    );
    expect(v.stock).to.equal(stockBefore - 1);

    // Admin orders list
    const orders = await api()
      .get(`${BASE}/admin/orders`)
      .set(auth(adminToken))
      .expect(200);
    expect(orders.body.orders.some((o) => o.orderNumber === orderNumber)).to
      .equal(true);

    // Admin status → processing → packed → shipped (with tracking)
    const orderId = confirmed.body.order._id;
    await api()
      .patch(`${BASE}/admin/orders/${orderId}/status`)
      .set(auth(adminToken))
      .send({ status: 'processing' })
      .expect(200);

    await api()
      .patch(`${BASE}/admin/orders/${orderId}/status`)
      .set(auth(adminToken))
      .send({ status: 'packed' })
      .expect(200);

    const shipped = await api()
      .post(`${BASE}/admin/orders/${orderId}/shipment`)
      .set(auth(adminToken))
      .send({
        trackingNumber: 'TRK123',
        carrier: 'Delhivery',
        trackingUrl: 'https://example.com/track/TRK123',
      })
      .expect(200);
    expect(shipped.body.order.status).to.equal('shipped');
    expect(shipped.body.order.trackingNumber).to.equal('TRK123');
  });

  it('user can save address and merge guest cart after login', async function () {
    const { token } = await registerUser();

    const addr = await api()
      .post(`${BASE}/addresses`)
      .set(auth(token))
      .send({
        fullName: 'User Home',
        phone: '8888888888',
        line1: 'Addr 1',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        isDefault: true,
      })
      .expect(201);
    expect(addr.body.address.isDefault).to.equal(true);

    const guest = await api()
      .post(`${BASE}/cart/items`)
      .send({ productId: product._id, variantId, quantity: 1 })
      .expect(201);

    const merged = await api()
      .post(`${BASE}/cart/merge`)
      .set(auth(token))
      .set('x-guest-token', guest.body.guestToken)
      .expect(200);
    expect(merged.body.cart.items.length).to.be.greaterThan(0);
  });
});
