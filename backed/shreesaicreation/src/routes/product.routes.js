import express from 'express';
import ProductController from '../controllers/product.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  productCreateSchema,
  productUpdateSchema,
  productStatusSchema,
  variantCreateSchema,
  variantUpdateSchema,
  mediaAttachSchema,
} from '../validators/catalog.validator.js';
import {
  reviewPublicRouter,
} from './review.routes.js';
import { productCsvAdminRouter } from './productCsv.routes.js';

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/', ProductController.listPublic);
publicRouter.get('/search', ProductController.search);
publicRouter.get('/filters', ProductController.filters);
publicRouter.use('/:slug/reviews', reviewPublicRouter);
publicRouter.get('/:slug', ProductController.getBySlug);

adminRouter.use(AuthJwt.verifyAdmin);
adminRouter.use(productCsvAdminRouter);
adminRouter.get('/', AuthJwt.hasPermission('Products'), ProductController.listAdmin);
adminRouter.post(
  '/',
  AuthJwt.hasPermission('Products'),
  validate(productCreateSchema),
  ProductController.create
);
adminRouter.get('/:id', AuthJwt.hasPermission('Products'), ProductController.getById);
adminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Products'),
  validate(productUpdateSchema),
  ProductController.update
);
adminRouter.patch(
  '/:id/status',
  AuthJwt.hasPermission('Products'),
  validate(productStatusSchema),
  ProductController.updateStatus
);
adminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Products'),
  ProductController.remove
);
adminRouter.post(
  '/:id/variants',
  AuthJwt.hasPermission('Products'),
  validate(variantCreateSchema),
  ProductController.addVariant
);
adminRouter.patch(
  '/:id/variants/:variantId',
  AuthJwt.hasPermission('Products'),
  validate(variantUpdateSchema),
  ProductController.updateVariant
);
adminRouter.delete(
  '/:id/variants/:variantId',
  AuthJwt.hasPermission('Products'),
  ProductController.removeVariant
);
adminRouter.post(
  '/:id/media',
  AuthJwt.hasPermission('Products'),
  validate(mediaAttachSchema),
  ProductController.attachMedia
);

export { publicRouter as productPublicRoutes, adminRouter as productAdminRoutes };
