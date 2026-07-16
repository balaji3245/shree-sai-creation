import express from 'express';
import UploadController from '../controllers/upload.controller.js';
import AuthJwt from '../middleware/auth.js';
import { upload } from '../middleware/uploads.js';

const router = express.Router();

router.post(
  '/',
  AuthJwt.verifyAdmin,
  AuthJwt.hasPermission('Media'),
  upload.array('files', 12),
  UploadController.upload
);

export default router;
