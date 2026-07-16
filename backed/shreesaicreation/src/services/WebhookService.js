import orderRepository from '../repositories/order.repository.js';
import { checkoutService } from './CheckoutService.js';
import { verifyWebhookSignature } from '../config/razorpay.js';
import { UnauthorizedError, ValidationError } from '../utilities/apiResponse.js';
import logger from '../utilities/logger.js';

class WebhookService {
  async handleRazorpay(rawBody, signature) {
    if (!verifyWebhookSignature(rawBody, signature || '')) {
      throw new UnauthorizedError('Invalid webhook signature');
    }

    let event;
    try {
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch {
      throw new ValidationError('Invalid webhook body');
    }

    const eventType = event.event;
    const payload = event.payload || {};

    logger.info({ eventType }, 'Razorpay webhook received');

    if (
      eventType === 'payment.captured' ||
      eventType === 'payment.authorized'
    ) {
      const paymentEntity = payload.payment?.entity;
      if (!paymentEntity) return { handled: false };

      const rzOrderId = paymentEntity.order_id;
      const order = await orderRepository.findByRazorpayOrderId(rzOrderId);
      if (!order) {
        logger.warn({ rzOrderId }, 'Order not found for webhook');
        return { handled: false };
      }

      await checkoutService.markOrderPaid(order, {
        razorpayPaymentId: paymentEntity.id,
        source: 'webhook',
        raw: paymentEntity,
      });

      return { handled: true, orderNumber: order.orderNumber };
    }

    if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      if (!paymentEntity?.order_id) return { handled: false };
      const order = await orderRepository.findByRazorpayOrderId(
        paymentEntity.order_id
      );
      if (order && order.status === 'pending_payment') {
        order.paymentStatus = 'failed';
        order.statusHistory.push({
          status: order.status,
          at: new Date(),
          by: 'webhook',
          note: 'Payment failed',
        });
        await orderRepository.save(order);
      }
      return { handled: true };
    }

    return { handled: false, eventType };
  }
}

export default new WebhookService();
