import OrderModel from '../models/order.model.js';

class OrderRepository {
  create(payload) {
    return OrderModel.create(payload);
  }

  findById(id) {
    return OrderModel.findById(id);
  }

  findByOrderNumber(orderNumber) {
    return OrderModel.findOne({ orderNumber });
  }

  findByRazorpayOrderId(razorpayOrderId) {
    return OrderModel.findOne({ razorpayOrderId });
  }

  findMany(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return OrderModel.find(filter).sort(sort).skip(skip).limit(limit);
  }

  count(filter = {}) {
    return OrderModel.countDocuments(filter);
  }

  updateById(id, update) {
    return OrderModel.findByIdAndUpdate(id, update, { new: true });
  }

  async save(order) {
    return order.save();
  }

  countPaidByUser(userId) {
    return OrderModel.countDocuments({
      userId,
      status: { $nin: ['pending_payment', 'cancelled'] },
    });
  }

  countPaidByEmail(email) {
    return OrderModel.countDocuments({
      guestEmail: email?.toLowerCase(),
      status: { $nin: ['pending_payment', 'cancelled'] },
    });
  }
}

export default new OrderRepository();
