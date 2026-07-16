import { handleApiRequest } from '../utilities/apiResponse.js';
import CartService from '../services/CartService.js';

function cartCtx(req) {
  return {
    userId: req.userId || null,
    guestToken: req.guestToken || null,
    email: req.userEmail || req.email || null,
  };
}

class CartController {
  get(req, res) {
    return handleApiRequest(req, res, async () => CartService.getCart(cartCtx(req)));
  }

  addItem(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await CartService.addItem(cartCtx(req), req.body);
      return [result, 'Item added', 201];
    });
  }

  updateItem(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.updateItem(cartCtx(req), req.params.itemId, req.body)
    );
  }

  removeItem(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.removeItem(cartCtx(req), req.params.itemId)
    );
  }

  clear(req, res) {
    return handleApiRequest(req, res, async () => CartService.clear(cartCtx(req)));
  }

  applyCoupon(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.applyCoupon(cartCtx(req), req.body.code)
    );
  }

  removeCoupon(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.removeCoupon(cartCtx(req))
    );
  }

  merge(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.merge(req.userId, req.headers['x-guest-token'] || req.body.guestToken)
    );
  }

  summary(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await CartService.getCart(cartCtx(req));
      return [{ summary: result.summary, guestToken: result.guestToken }, 'OK'];
    });
  }
}

export default new CartController();
