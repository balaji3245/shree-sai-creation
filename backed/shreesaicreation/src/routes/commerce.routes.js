import express from 'express';
import {
  checkoutController,
  orderController,
  shippingController,
  couponController,
} from '../controllers/commerce.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  checkoutCreateSchema,
  checkoutConfirmSchema,
  orderCancelSchema,
  orderStatusSchema,
  orderRefundSchema,
  couponCreateSchema,
  couponApplySchema,
  shipmentSchema,
} from '../validators/commerce.validator.js';

const checkoutRouter = express.Router();
checkoutRouter.use(AuthJwt.optionalUserOrGuest);
checkoutRouter.post('/preview', checkoutController.preview);
checkoutRouter.post(
  '/create-order',
  validate(checkoutCreateSchema),
  checkoutController.createOrder
);
checkoutRouter.post(
  '/confirm',
  validate(checkoutConfirmSchema),
  checkoutController.confirm
);

const orderRouter = express.Router();
orderRouter.get('/', AuthJwt.verifyUser, orderController.listMine);
orderRouter.get('/:orderNumber', AuthJwt.optionalUserOrGuest, orderController.getOne);
orderRouter.post(
  '/:orderNumber/cancel',
  AuthJwt.verifyUser,
  validate(orderCancelSchema),
  orderController.cancel
);
orderRouter.get(
  '/:orderNumber/invoice',
  AuthJwt.optionalUserOrGuest,
  orderController.invoice
);

const adminOrderRouter = express.Router();
adminOrderRouter.use(AuthJwt.verifyAdmin);
adminOrderRouter.get('/', AuthJwt.hasPermission('Orders'), orderController.listAdmin);
adminOrderRouter.get(
  '/:orderNumber',
  AuthJwt.hasPermission('Orders'),
  orderController.getAdmin
);
adminOrderRouter.patch(
  '/:id/status',
  AuthJwt.hasPermission('Orders'),
  validate(orderStatusSchema),
  orderController.updateStatus
);
adminOrderRouter.post(
  '/:id/refund',
  AuthJwt.hasPermission('Orders'),
  validate(orderRefundSchema),
  orderController.refund
);
adminOrderRouter.post(
  '/:id/shipment',
  AuthJwt.hasPermission('Orders'),
  validate(shipmentSchema),
  orderController.addShipment
);

const shippingRouter = express.Router();
shippingRouter.use(AuthJwt.optionalUserOrGuest);
shippingRouter.post('/quote', shippingController.quote);

const couponPublicRouter = express.Router();
couponPublicRouter.use(AuthJwt.optionalUserOrGuest);
couponPublicRouter.post(
  '/validate',
  validate(couponApplySchema),
  couponController.validate
);

const couponAdminRouter = express.Router();
couponAdminRouter.use(AuthJwt.verifyAdmin);
couponAdminRouter.get('/', AuthJwt.hasPermission('Coupons'), couponController.list);
couponAdminRouter.post(
  '/',
  AuthJwt.hasPermission('Coupons'),
  validate(couponCreateSchema),
  couponController.create
);
couponAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Coupons'),
  couponController.update
);
couponAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Coupons'),
  couponController.remove
);

export {
  checkoutRouter,
  orderRouter,
  adminOrderRouter,
  shippingRouter,
  couponPublicRouter,
  couponAdminRouter,
};
