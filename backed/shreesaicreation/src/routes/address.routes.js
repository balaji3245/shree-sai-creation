import express from 'express';
import AddressController from '../controllers/address.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  addressSchema,
  addressUpdateSchema,
} from '../validators/commerce.validator.js';

const router = express.Router();

router.use(AuthJwt.verifyUser);
router.get('/', AddressController.list);
router.post('/', validate(addressSchema), AddressController.create);
router.patch('/:id', validate(addressUpdateSchema), AddressController.update);
router.patch('/:id/default', AddressController.setDefault);
router.delete('/:id', AddressController.remove);

export default router;
