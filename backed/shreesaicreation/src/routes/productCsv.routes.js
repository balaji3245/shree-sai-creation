import express from 'express';
import multer from 'multer';
import ProductCsvController from '../controllers/productCsv.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { relatedProductsSchema } from '../validators/productCsv.validator.js';

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const productCsvAdminRouter = express.Router();
productCsvAdminRouter.use(AuthJwt.verifyAdmin);
productCsvAdminRouter.get(
  '/export',
  AuthJwt.hasPermission('Products'),
  ProductCsvController.exportProducts
);
productCsvAdminRouter.post(
  '/import',
  AuthJwt.hasPermission('Products'),
  uploadMemory.single('file'),
  ProductCsvController.importProducts
);
productCsvAdminRouter.patch(
  '/:id/related',
  AuthJwt.hasPermission('Products'),
  validate(relatedProductsSchema),
  ProductCsvController.setRelated
);
