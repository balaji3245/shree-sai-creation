import express from 'express';
import WebhookController from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/razorpay', WebhookController.razorpay);

export default router;
