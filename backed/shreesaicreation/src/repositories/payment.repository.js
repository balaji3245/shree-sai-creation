import PaymentModel from '../models/payment.model.js';

class PaymentRepository {
  create(payload) {
    return PaymentModel.create(payload);
  }

  findById(id) {
    return PaymentModel.findById(id);
  }

  findByRazorpayPaymentId(razorpayPaymentId) {
    return PaymentModel.findOne({ razorpayPaymentId });
  }

  findByRazorpayOrderId(razorpayOrderId) {
    return PaymentModel.findOne({ razorpayOrderId }).sort({ createdAt: -1 });
  }

  findByOrderId(orderId) {
    return PaymentModel.find({ orderId }).sort({ createdAt: -1 });
  }

  updateById(id, update) {
    return PaymentModel.findByIdAndUpdate(id, update, { new: true });
  }

  async save(payment) {
    return payment.save();
  }
}

export default new PaymentRepository();
