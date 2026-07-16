import express from 'express';
import ShippingZoneController from '../controllers/shippingZone.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  shippingZoneSchema,
  shippingZoneUpdateSchema,
} from '../validators/shippingZone.validator.js';

export const shippingZonesAdminRouter = express.Router();
shippingZonesAdminRouter.use(AuthJwt.verifyAdmin);
shippingZonesAdminRouter.get(
  '/',
  AuthJwt.hasPermission('Shipping'),
  ShippingZoneController.listZones
);
shippingZonesAdminRouter.post(
  '/',
  AuthJwt.hasPermission('Shipping'),
  validate(shippingZoneSchema),
  ShippingZoneController.createZone
);
shippingZonesAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Shipping'),
  validate(shippingZoneUpdateSchema),
  ShippingZoneController.updateZone
);
shippingZonesAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Shipping'),
  ShippingZoneController.removeZone
);
