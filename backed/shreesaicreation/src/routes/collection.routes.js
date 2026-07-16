import express from 'express';
import CollectionController from '../controllers/collection.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  collectionCreateSchema,
  collectionUpdateSchema,
} from '../validators/catalog.validator.js';

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.get('/', CollectionController.listPublic);
publicRouter.get('/:slug', CollectionController.getBySlug);

adminRouter.use(AuthJwt.verifyAdmin);
adminRouter.get('/', AuthJwt.hasPermission('Collections'), CollectionController.listAdmin);
adminRouter.post(
  '/',
  AuthJwt.hasPermission('Collections'),
  validate(collectionCreateSchema),
  CollectionController.create
);
adminRouter.get('/:id', AuthJwt.hasPermission('Collections'), CollectionController.getById);
adminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Collections'),
  validate(collectionUpdateSchema),
  CollectionController.update
);
adminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Collections'),
  CollectionController.remove
);

export {
  publicRouter as collectionPublicRoutes,
  adminRouter as collectionAdminRoutes,
};
