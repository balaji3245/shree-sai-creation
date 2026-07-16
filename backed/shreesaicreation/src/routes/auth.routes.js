import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
} from '../validators/commerce.validator.js';

const router = express.Router();

router.post('/register', validate(userRegisterSchema), AuthController.register);
router.post('/login', validate(userLoginSchema), AuthController.login);
router.get('/me', AuthJwt.verifyUser, AuthController.me);
router.patch(
  '/me',
  AuthJwt.verifyUser,
  validate(userUpdateSchema),
  AuthController.updateMe
);

export default router;
