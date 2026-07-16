import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  reviewCreateSchema,
  reviewModerateSchema,
} from '../validators/review.validator.js';

export const reviewPublicRouter = express.Router({ mergeParams: true });
reviewPublicRouter.get('/', ReviewController.listProductReviews);
reviewPublicRouter.post(
  '/',
  AuthJwt.verifyUser,
  validate(reviewCreateSchema),
  ReviewController.createReview
);

export const reviewsAdminRouter = express.Router();
reviewsAdminRouter.use(AuthJwt.verifyAdmin);
reviewsAdminRouter.get(
  '/',
  AuthJwt.hasPermission('Reviews'),
  ReviewController.listReviewsAdmin
);
reviewsAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Reviews'),
  validate(reviewModerateSchema),
  ReviewController.moderateReview
);
