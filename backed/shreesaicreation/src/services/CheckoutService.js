import orderRepository from '../repositories/order.repository.js';
import paymentRepository from '../repositories/payment.repository.js';
import cartRepository from '../repositories/cart.repository.js';
import couponRepository from '../repositories/coupon.repository.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import CartService from './CartService.js';
import InventoryService from './InventoryService.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  isMockPayments,
  createRefund,
} from '../config/razorpay.js';
import { generateOrderNumber } from '../utilities/orderNumber.js';
import { generateInvoicePdf } from '../utilities/invoice.js';
import { paiseToRupees } from '../utilities/money.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from '../utilities/apiResponse.js';
import {
  ORDER_TRANSITIONS,
  CUSTOMER_CANCELLABLE,
} from '../constants/orderStatus.constants.js';
import logger from '../utilities/logger.js';

function serializeOrder(order) {
  const obj = order.toObject ? order.toObject() : { ...order };
  return {
    ...obj,
    subtotal: paiseToRupees(obj.subtotalInPaise),
    discount: paiseToRupees(obj.discountInPaise),
    shipping: paiseToRupees(obj.shippingInPaise),
    tax: paiseToRupees(obj.taxInPaise),
    grandTotal: paiseToRupees(obj.grandTotalInPaise),
  };
}

function pushStatus(order, status, by = 'system', note = '') {
  order.status = status;
  order.statusHistory.push({ status, at: new Date(), by, note });
}

class CheckoutService {
  async preview(ctx, { shippingAddress } = {}) {
    const cart = await CartService.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart?.items?.length) throw new ValidationError('Cart is empty');

    const summary = await CartService.buildSummary(cart, {
      ...ctx,
      email: shippingAddress?.email || ctx.email,
    });

    return {
      summary,
      shippingAddress: shippingAddress || null,
      cart: CartService.serializeCart(cart),
    };
  }

  async createOrder(ctx, payload) {
    const {
      shippingAddress,
      billingAddress,
      email,
      phone,
      createAccount: _createAccount,
    } = payload;

    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.line1) {
      throw new ValidationError('Complete shipping address is required');
    }
    if (!shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      throw new ValidationError('city, state, pincode are required');
    }

    const guestEmail = (email || shippingAddress.email || ctx.email || '').toLowerCase();
    const guestPhone = phone || shippingAddress.phone;

    if (!ctx.userId && !guestEmail) {
      throw new ValidationError('Email is required for guest checkout');
    }

    const cart = await CartService.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart?.items?.length) throw new ValidationError('Cart is empty');

    const summary = await CartService.buildSummary(cart, {
      ...ctx,
      email: guestEmail,
    });

    if (summary.grandTotalInPaise <= 0) {
      throw new ValidationError('Invalid order total');
    }

    // Final stock check
    for (const line of summary.lineItems) {
      await InventoryService.assertAvailable(
        line.productId,
        line.variantId,
        line.quantity
      );
    }

    const orderNumber = generateOrderNumber();
    const order = await orderRepository.create({
      orderNumber,
      userId: ctx.userId || null,
      guestEmail: ctx.userId ? null : guestEmail,
      guestPhone: ctx.userId ? null : guestPhone,
      items: summary.lineItems.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        productName: l.productName,
        variantTitle: l.variantTitle,
        sku: l.sku,
        hsnCode: l.hsnCode,
        quantity: l.quantity,
        unitPriceInPaise: l.unitPriceInPaise,
        taxPercent: l.taxPercent,
        lineTotalInPaise: l.lineTotalInPaise,
        imageUrl: l.imageUrl,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: guestEmail || shippingAddress.email || '',
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'IN',
      },
      billingAddress: billingAddress || null,
      status: 'pending_payment',
      statusHistory: [
        {
          status: 'pending_payment',
          at: new Date(),
          by: ctx.userId ? 'user' : 'guest',
          note: 'Order created',
        },
      ],
      subtotalInPaise: summary.subtotalInPaise,
      discountInPaise: summary.discountInPaise,
      shippingInPaise: summary.shippingInPaise,
      taxInPaise: summary.taxInPaise,
      grandTotalInPaise: summary.grandTotalInPaise,
      couponCode: summary.couponCode,
      freeShippingApplied: summary.freeShipping,
      paymentStatus: 'created',
    });

    const rzOrder = await createRazorpayOrder({
      amountInPaise: order.grandTotalInPaise,
      receipt: orderNumber.slice(0, 40),
      notes: { orderNumber, orderId: order._id.toString() },
    });

    order.razorpayOrderId = rzOrder.id;
    await orderRepository.save(order);

    await paymentRepository.create({
      orderId: order._id,
      orderNumber,
      amountInPaise: order.grandTotalInPaise,
      status: 'created',
      razorpayOrderId: rzOrder.id,
    });

    // Clear cart after order create (pending payment)
    cart.items = [];
    cart.couponCode = null;
    await cartRepository.save(cart);

    return {
      order: serializeOrder(order),
      razorpay: {
        orderId: rzOrder.id,
        amount: order.grandTotalInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || null,
        mock: isMockPayments(),
      },
    };
  }

  /**
   * Client-side confirm after Razorpay checkout. Idempotent.
   * Webhook remains source of truth for capture events.
   */
  async confirmPayment(ctx, payload) {
    const {
      orderNumber,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = payload;

    if (!orderNumber || !razorpay_order_id || !razorpay_payment_id) {
      throw new ValidationError(
        'orderNumber, razorpay_order_id, razorpay_payment_id are required'
      );
    }

    const valid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || 'mock_signature',
    });
    if (!valid) throw new ValidationError('Invalid payment signature');

    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order not found');

    // Payment signature authenticates the confirm; soft ownership check only
    if (ctx.userId && order.userId && String(order.userId) !== String(ctx.userId)) {
      throw new ForbiddenError('Not your order');
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      throw new ValidationError('Razorpay order mismatch');
    }

    if (['paid', 'processing', 'packed', 'shipped', 'delivered', 'completed'].includes(order.status)) {
      return { order: serializeOrder(order), alreadyPaid: true };
    }

    return this.markOrderPaid(order, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      source: 'client_confirm',
    });
  }

  async markOrderPaid(order, { razorpayPaymentId, razorpaySignature, source, raw } = {}) {
    // Idempotent: skip if already processed this payment
    if (razorpayPaymentId) {
      const existingPay = await paymentRepository.findByRazorpayPaymentId(
        razorpayPaymentId
      );
      if (existingPay && existingPay.status === 'captured') {
        const fresh = await orderRepository.findById(order._id);
        return { order: serializeOrder(fresh), alreadyPaid: true };
      }
    }

    if (!order.inventoryDecremented) {
      await InventoryService.decrementForOrderItems(order.items);
      order.inventoryDecremented = true;
    }

    pushStatus(order, 'paid', source || 'system', 'Payment captured');
    order.paymentStatus = 'captured';
    order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
    order.paidAt = new Date();

    if (order.couponCode) {
      const coupon = await couponRepository.findByCode(order.couponCode);
      if (coupon) {
        await couponRepository.incrementUsage(coupon._id);
        await couponRepository.createRedemption({
          couponId: coupon._id,
          code: coupon.code,
          userId: order.userId || null,
          email: order.guestEmail || order.shippingAddress?.email || null,
          orderId: order._id,
        });
      }
    }

    await orderRepository.save(order);

    // Upsert payment record
    let payment = razorpayPaymentId
      ? await paymentRepository.findByRazorpayPaymentId(razorpayPaymentId)
      : null;

    if (!payment) {
      payment = await paymentRepository.findByRazorpayOrderId(order.razorpayOrderId);
    }

    if (payment) {
      payment.status = 'captured';
      payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature || payment.razorpaySignature;
      payment.raw = raw || payment.raw;
      await paymentRepository.save(payment);
    } else {
      await paymentRepository.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        amountInPaise: order.grandTotalInPaise,
        status: 'captured',
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        raw,
      });
    }

    // Invoice generation (sync for Phase 2; can move to BullMQ later)
    try {
      const settings = await storeSettingsRepository.findDefault();
      const invoice = await generateInvoicePdf(order, settings?.toObject?.() || settings || {});
      order.invoiceKey = invoice.key;
      order.invoiceUrl = `/uploads/invoices/${invoice.filename}`;
      await orderRepository.save(order);
    } catch (err) {
      logger.error({ err, orderNumber: order.orderNumber }, 'Invoice generation failed');
    }

    // Fire-and-forget order placed email
    try {
      const NotificationService = (await import('./NotificationService.js')).default;
      await NotificationService.orderPlaced(order);
    } catch (err) {
      logger.error({ err }, 'order placed notification failed');
    }

    return { order: serializeOrder(order), alreadyPaid: false };
  }

  assertOrderAccess(order, ctx) {
    if (ctx.isAdminUser) return;
    if (ctx.userId && order.userId && String(order.userId) === String(ctx.userId)) {
      return;
    }
    if (
      ctx.guestEmail &&
      order.guestEmail &&
      ctx.guestEmail.toLowerCase() === order.guestEmail.toLowerCase()
    ) {
      return;
    }
    // Allow access if user owns it
    if (ctx.userId && order.userId && String(order.userId) === String(ctx.userId)) {
      return;
    }
    if (ctx.userId && !order.userId) {
      // guest order — require matching email via query not available
    }
    if (!ctx.isAdminUser && ctx.userId && order.userId && String(order.userId) !== String(ctx.userId)) {
      throw new ForbiddenError('Not your order');
    }
  }
}

class OrderService {
  async listMine(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const filter = { userId };
    const [orders, total] = await Promise.all([
      orderRepository.findMany(filter, { skip, limit }),
      orderRepository.count(filter),
    ]);
    return {
      orders: orders.map(serializeOrder),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getByOrderNumber(orderNumber, ctx) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order not found');

    if (ctx.isAdminUser) {
      return { order: serializeOrder(order) };
    }
    if (ctx.userId && order.userId && String(order.userId) === String(ctx.userId)) {
      return { order: serializeOrder(order) };
    }
    if (
      ctx.email &&
      order.guestEmail &&
      ctx.email.toLowerCase() === order.guestEmail.toLowerCase()
    ) {
      return { order: serializeOrder(order) };
    }
    throw new ForbiddenError('Not your order');
  }

  async cancelByCustomer(orderNumber, ctx, { reason } = {}) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) throw new NotFoundError('Order not found');

    if (ctx.userId && order.userId && String(order.userId) !== String(ctx.userId)) {
      throw new ForbiddenError('Not your order');
    }
    if (!ctx.userId && order.userId) {
      throw new ForbiddenError('Login required');
    }

    if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw new ConflictError(`Cannot cancel order in status: ${order.status}`);
    }

    const wasPaid = order.inventoryDecremented;
    pushStatus(order, 'cancelled', 'user', reason || 'Cancelled by customer');
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Cancelled by customer';

    if (wasPaid) {
      await InventoryService.restockForOrderItems(order.items);
      order.inventoryDecremented = false;
    }

    if (order.paymentStatus === 'captured' && order.razorpayPaymentId) {
      try {
        const refund = await createRefund({
          paymentId: order.razorpayPaymentId,
          amountInPaise: order.grandTotalInPaise,
          notes: { orderNumber: order.orderNumber, reason: 'customer_cancel' },
        });
        order.paymentStatus = 'refunded';
        pushStatus(order, 'refunded', 'system', `Refund ${refund.id}`);
        const payment = await paymentRepository.findByRazorpayPaymentId(
          order.razorpayPaymentId
        );
        if (payment) {
          payment.status = 'refunded';
          payment.refundId = refund.id;
          payment.refundedAmountInPaise = order.grandTotalInPaise;
          await paymentRepository.save(payment);
        }
      } catch (err) {
        logger.error({ err }, 'Refund on cancel failed');
      }
    }

    await orderRepository.save(order);
    return { order: serializeOrder(order) };
  }

  async listAdmin({ page = 1, limit = 20, status, search } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      orderRepository.findMany(filter, { skip, limit }),
      orderRepository.count(filter),
    ]);
    return {
      orders: orders.map(serializeOrder),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async updateStatus(orderId, { status, note, trackingNumber, trackingUrl, carrier }, adminId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    const allowed = ORDER_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new ConflictError(
        `Cannot transition from ${order.status} to ${status}`
      );
    }

    pushStatus(order, status, `admin:${adminId}`, note || '');
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (carrier) order.carrier = carrier;

    await orderRepository.save(order);

    try {
      const NotificationService = (await import('./NotificationService.js')).default;
      if (status === 'shipped') await NotificationService.orderShipped(order);
      if (status === 'delivered') await NotificationService.orderDelivered(order);
    } catch (err) {
      logger.error({ err }, 'status notification failed');
    }

    return { order: serializeOrder(order) };
  }

  async addShipment(orderId, { trackingNumber, trackingUrl, carrier, note }, adminId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (!trackingNumber) throw new ValidationError('trackingNumber required');

    order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (carrier) order.carrier = carrier;

    if (['paid', 'processing', 'packed'].includes(order.status)) {
      const allowed = ORDER_TRANSITIONS[order.status] || [];
      if (allowed.includes('shipped')) {
        pushStatus(order, 'shipped', `admin:${adminId}`, note || 'Shipment added');
      }
    } else if (order.status === 'shipped') {
      order.statusHistory.push({
        status: 'shipped',
        at: new Date(),
        by: `admin:${adminId}`,
        note: note || 'Tracking updated',
      });
    } else {
      throw new ConflictError(`Cannot add shipment in status: ${order.status}`);
    }

    await orderRepository.save(order);

    try {
      const NotificationService = (await import('./NotificationService.js')).default;
      await NotificationService.orderShipped(order);
    } catch (err) {
      logger.error({ err }, 'shipment notification failed');
    }

    return { order: serializeOrder(order) };
  }

  async refund(orderId, { amountInPaise, note } = {}, adminId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (!order.razorpayPaymentId) {
      throw new ValidationError('No payment to refund');
    }
    if (!['paid', 'processing', 'packed', 'on_hold'].includes(order.status)) {
      throw new ConflictError(`Cannot refund order in status: ${order.status}`);
    }

    const amount = amountInPaise || order.grandTotalInPaise;
    const refund = await createRefund({
      paymentId: order.razorpayPaymentId,
      amountInPaise: amount,
      notes: { orderNumber: order.orderNumber, by: adminId },
    });

    const payment = await paymentRepository.findByRazorpayPaymentId(
      order.razorpayPaymentId
    );
    if (payment) {
      payment.refundId = refund.id;
      payment.refundedAmountInPaise = (payment.refundedAmountInPaise || 0) + amount;
      payment.status =
        payment.refundedAmountInPaise >= payment.amountInPaise
          ? 'refunded'
          : 'partially_refunded';
      await paymentRepository.save(payment);
    }

    if (amount >= order.grandTotalInPaise) {
      pushStatus(order, 'refunded', `admin:${adminId}`, note || `Refund ${refund.id}`);
      order.paymentStatus = 'refunded';
      if (order.inventoryDecremented) {
        await InventoryService.restockForOrderItems(order.items);
        order.inventoryDecremented = false;
      }
    } else {
      order.paymentStatus = 'partially_refunded';
      order.statusHistory.push({
        status: order.status,
        at: new Date(),
        by: `admin:${adminId}`,
        note: note || `Partial refund ${refund.id}`,
      });
    }

    await orderRepository.save(order);

    try {
      const NotificationService = (await import('./NotificationService.js')).default;
      await NotificationService.orderRefunded(order, { amountInPaise: amount });
    } catch (err) {
      logger.error({ err }, 'refund notification failed');
    }

    return { order: serializeOrder(order), refund };
  }

  async getInvoicePath(orderNumber, ctx) {
    const { order } = await this.getByOrderNumber(orderNumber, ctx);
    if (!order.invoiceUrl && !order.invoiceKey) {
      throw new NotFoundError('Invoice not ready');
    }
    return order;
  }
}

export const checkoutService = new CheckoutService();
export const orderService = new OrderService();
export { serializeOrder };
export default { checkoutService, orderService };
