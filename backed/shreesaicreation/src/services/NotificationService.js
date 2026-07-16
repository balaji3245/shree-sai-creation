import { sendMail } from '../config/mailer.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import { paiseToRupees } from '../utilities/money.js';
import logger from '../utilities/logger.js';

function orderEmail(order) {
  return (
    order.guestEmail ||
    order.shippingAddress?.email ||
    null
  );
}

function money(paise) {
  const r = paiseToRupees(paise);
  return r == null ? '0.00' : Number(r).toFixed(2);
}

async function storeName() {
  const s = await storeSettingsRepository.findDefault();
  return s?.storeName || 'Shree Sai Creation';
}

function itemsHtml(order) {
  return (order.items || [])
    .map(
      (i) =>
        `<li>${i.productName} (${i.variantTitle}) × ${i.quantity} — ₹${money(i.lineTotalInPaise)}</li>`
    )
    .join('');
}

class NotificationService {
  async orderPlaced(order) {
    const to = orderEmail(order);
    const name = await storeName();
    try {
      await sendMail({
        to,
        subject: `${name} — Order ${order.orderNumber} confirmed`,
        html: `
          <h2>Thank you for your order</h2>
          <p>Order <strong>${order.orderNumber}</strong> is confirmed and paid.</p>
          <ul>${itemsHtml(order)}</ul>
          <p><strong>Total: ₹${money(order.grandTotalInPaise)}</strong></p>
          ${order.invoiceUrl ? `<p><a href="${order.invoiceUrl}">Download invoice</a></p>` : ''}
        `,
      });
    } catch (err) {
      logger.error({ err, orderNumber: order.orderNumber }, 'orderPlaced email failed');
    }
  }

  async orderShipped(order) {
    const to = orderEmail(order);
    const name = await storeName();
    try {
      await sendMail({
        to,
        subject: `${name} — Order ${order.orderNumber} shipped`,
        html: `
          <h2>Your order is on the way</h2>
          <p>Order <strong>${order.orderNumber}</strong> has been shipped.</p>
          ${order.carrier ? `<p>Carrier: ${order.carrier}</p>` : ''}
          ${order.trackingNumber ? `<p>Tracking: ${order.trackingNumber}</p>` : ''}
          ${order.trackingUrl ? `<p><a href="${order.trackingUrl}">Track shipment</a></p>` : ''}
        `,
      });
    } catch (err) {
      logger.error({ err, orderNumber: order.orderNumber }, 'orderShipped email failed');
    }
  }

  async orderDelivered(order) {
    const to = orderEmail(order);
    const name = await storeName();
    try {
      await sendMail({
        to,
        subject: `${name} — Order ${order.orderNumber} delivered`,
        html: `
          <h2>Delivered</h2>
          <p>Order <strong>${order.orderNumber}</strong> has been marked delivered. We hope you love your lighting.</p>
        `,
      });
    } catch (err) {
      logger.error({ err, orderNumber: order.orderNumber }, 'orderDelivered email failed');
    }
  }

  async orderRefunded(order, { amountInPaise } = {}) {
    const to = orderEmail(order);
    const name = await storeName();
    const amount = amountInPaise ?? order.grandTotalInPaise;
    try {
      await sendMail({
        to,
        subject: `${name} — Refund for ${order.orderNumber}`,
        html: `
          <h2>Refund processed</h2>
          <p>A refund of <strong>₹${money(amount)}</strong> for order <strong>${order.orderNumber}</strong> has been initiated.</p>
        `,
      });
    } catch (err) {
      logger.error({ err, orderNumber: order.orderNumber }, 'orderRefunded email failed');
    }
  }
}

export default new NotificationService();
