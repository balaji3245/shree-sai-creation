import express from 'express';
import CategoryController from '../controllers/category.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  categoryReorderSchema,
} from '../validators/catalog.validator.js';

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/', CategoryController.listPublic);
publicRouter.get('/:slug', CategoryController.getBySlug);

adminRouter.use(AuthJwt.verifyAdmin);
adminRouter.get('/', AuthJwt.hasPermission('Categories'), CategoryController.listAdmin);
adminRouter.post(
  '/',
  AuthJwt.hasPermission('Categories'),
  validate(categoryCreateSchema),
  CategoryController.create
);
adminRouter.patch(
  '/reorder',
  AuthJwt.hasPermission('Categories'),
  validate(categoryReorderSchema),
  CategoryController.reorder
);
adminRouter.get('/:id', AuthJwt.hasPermission('Categories'), CategoryController.getById);
adminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Categories'),
  validate(categoryUpdateSchema),
  CategoryController.update
);
adminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Categories'),
  CategoryController.remove
);

export { publicRouter as categoryPublicRoutes, adminRouter as categoryAdminRoutes };
