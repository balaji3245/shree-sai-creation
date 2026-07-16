import express from 'express';
import AdminController from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.js';
import { adminLoginSchema } from '../validators/catalog.validator.js';
import AuthJwt from '../middleware/auth.js';

const router = express.Router();

router.post('/auth/login', validate(adminLoginSchema), AdminController.login);
router.get('/auth/me', AuthJwt.verifyAdmin, AdminController.me);

export default router;
