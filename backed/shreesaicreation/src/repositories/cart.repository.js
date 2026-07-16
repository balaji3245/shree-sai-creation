import CartModel from '../models/cart.model.js';

class CartRepository {
  findByUserId(userId) {
    return CartModel.findOne({ userId });
  }

  findByGuestToken(guestToken) {
    return CartModel.findOne({ guestToken });
  }

  create(payload) {
    return CartModel.create(payload);
  }

  async save(cart) {
    return cart.save();
  }

  deleteById(id) {
    return CartModel.findByIdAndDelete(id);
  }

  findById(id) {
    return CartModel.findById(id);
  }
}

export default new CartRepository();
