import express from 'express';
import CartController from '../controllers/cart.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cartAddSchema,
  cartUpdateSchema,
  couponApplySchema,
} from '../validators/commerce.validator.js';

const router = express.Router();

router.use(AuthJwt.optionalUserOrGuest);

router.get('/', CartController.get);
router.get('/summary', CartController.summary);
router.post('/items', validate(cartAddSchema), CartController.addItem);
router.patch(
  '/items/:itemId',
  validate(cartUpdateSchema),
  CartController.updateItem
);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clear);
router.post('/coupon', validate(couponApplySchema), CartController.applyCoupon);
router.delete('/coupon', CartController.removeCoupon);
router.post('/merge', AuthJwt.verifyUser, CartController.merge);

export default router;
