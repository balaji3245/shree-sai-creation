import { handleApiRequest } from '../utilities/apiResponse.js';
import { checkoutService, orderService } from '../services/CheckoutService.js';
import CartService from '../services/CartService.js';
import CouponService from '../services/CouponService.js';
import { rupeesToPaise } from '../utilities/money.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ctx(req) {
  return {
    userId: req.userId || null,
    guestToken: req.guestToken || null,
    email: req.userEmail || req.body?.email || req.query?.email || null,
    isAdminUser: Boolean(req.isAdminUser),
  };
}

class CheckoutController {
  preview(req, res) {
    return handleApiRequest(req, res, async () =>
      checkoutService.preview(ctx(req), {
        shippingAddress: req.body.shippingAddress,
      })
    );
  }

  createOrder(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await checkoutService.createOrder(ctx(req), req.body);
      return [result, 'Order created', 201];
    });
  }

  confirm(req, res) {
    return handleApiRequest(req, res, async () =>
      checkoutService.confirmPayment(ctx(req), req.body)
    );
  }
}

class OrderController {
  listMine(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.listMine(req.userId, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
      })
    );
  }

  getOne(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.getByOrderNumber(req.params.orderNumber, {
        userId: req.userId,
        email: req.query.email || req.userEmail,
        isAdminUser: false,
      })
    );
  }

  cancel(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.cancelByCustomer(req.params.orderNumber, {
        userId: req.userId,
      }, req.body)
    );
  }

  async invoice(req, res) {
    try {
      const order = await orderService.getInvoicePath(req.params.orderNumber, {
        userId: req.userId,
        email: req.query.email || req.userEmail,
        isAdminUser: Boolean(req.isAdminUser),
      });
      const filename = `${order.orderNumber}.pdf`;
      const filepath = path.join(__dirname, '../../uploads/invoices', filename);
      return res.download(filepath, filename);
    } catch (error) {
      const { handleError } = await import('../utilities/apiResponse.js');
      return handleError(res, error);
    }
  }

  listAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
        status: req.query.status,
        search: req.query.search,
      })
    );
  }

  getAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.getByOrderNumber(req.params.orderNumber, { isAdminUser: true })
    );
  }

  updateStatus(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.updateStatus(req.params.id, req.body, req.adminId)
    );
  }

  refund(req, res) {
    return handleApiRequest(req, res, async () => {
      const amountInPaise =
        req.body.amountInPaise ??
        (req.body.amount != null ? rupeesToPaise(req.body.amount) : null);
      return orderService.refund(
        req.params.id,
        { amountInPaise, note: req.body.note },
        req.adminId
      );
    });
  }

  addShipment(req, res) {
    return handleApiRequest(req, res, async () =>
      orderService.addShipment(req.params.id, req.body, req.adminId)
    );
  }
}

class ShippingController {
  quote(req, res) {
    return handleApiRequest(req, res, async () =>
      CartService.quoteShipping(ctx(req), {
        state: req.body.state,
        pincode: req.body.pincode,
        city: req.body.city,
      })
    );
  }
}

class CouponController {
  validate(req, res) {
    return handleApiRequest(req, res, async () => {
      const cartResult = await CartService.getCart(ctx(req));
      const applied = await CouponService.validateForCart({
        code: req.body.code,
        subtotalInPaise: cartResult.summary.subtotalInPaise,
        items: cartResult.summary.lineItems || [],
        userId: req.userId,
        email: req.userEmail,
      });
      return [
        {
          code: applied.code,
          discountInPaise: applied.discountInPaise,
          discount: applied.discountInPaise / 100,
          freeShipping: applied.freeShipping,
        },
        'Coupon valid',
      ];
    });
  }

  create(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await CouponService.create(req.body);
      return [result, 'Coupon created', 201];
    });
  }

  list(req, res) {
    return handleApiRequest(req, res, async () =>
      CouponService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 50),
      })
    );
  }

  update(req, res) {
    return handleApiRequest(req, res, async () =>
      CouponService.update(req.params.id, req.body)
    );
  }

  remove(req, res) {
    return handleApiRequest(req, res, async () => CouponService.remove(req.params.id));
  }
}

export const checkoutController = new CheckoutController();
export const orderController = new OrderController();
export const shippingController = new ShippingController();
export const couponController = new CouponController();
