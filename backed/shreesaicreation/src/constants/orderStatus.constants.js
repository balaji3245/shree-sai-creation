export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
  'on_hold',
];

export const ORDER_TRANSITIONS = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'on_hold', 'cancelled', 'refunded'],
  processing: ['packed', 'on_hold', 'cancelled', 'refunded'],
  packed: ['shipped', 'on_hold'],
  shipped: ['delivered'],
  delivered: ['completed'],
  on_hold: ['processing', 'cancelled', 'refunded'],
  completed: [],
  cancelled: [],
  refunded: [],
};

export const CUSTOMER_CANCELLABLE = ['pending_payment', 'paid', 'processing'];

export const PAYMENT_STATUSES = [
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded',
];

export const DISCOUNT_TYPES = ['percentage', 'flat'];
