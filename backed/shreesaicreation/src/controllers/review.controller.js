import { handleApiRequest } from '../utilities/apiResponse.js';
import ReviewService from '../services/ReviewService.js';

class ReviewController {
  listProductReviews(req, res) {
    return handleApiRequest(req, res, async () =>
      ReviewService.listPublic(req.params.slug, {
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20),
      })
    );
  }

  createReview(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await ReviewService.create(
        req.userId,
        req.params.slug,
        req.body
      );
      return [result, 'Review submitted for moderation', 201];
    });
  }

  listReviewsAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      ReviewService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 50),
        status: req.query.status,
      })
    );
  }

  moderateReview(req, res) {
    return handleApiRequest(req, res, async () =>
      ReviewService.moderate(req.params.id, req.body, req.adminId)
    );
  }
}

export default new ReviewController();
