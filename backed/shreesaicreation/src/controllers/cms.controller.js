import { handleApiRequest } from '../utilities/apiResponse.js';
import BannerService from '../services/BannerService.js';
import HomeService from '../services/HomeService.js';
import PageService from '../services/PageService.js';
import FaqService from '../services/FaqService.js';
import InquiryService from '../services/InquiryService.js';
import NewsletterService from '../services/NewsletterService.js';
import WishlistService from '../services/WishlistService.js';
import StoreSettingsService from '../services/StoreSettingsService.js';

class CmsController {
  // Home
  getHome(req, res) {
    return handleApiRequest(req, res, async () => {
      const home = await HomeService.assembleHome();
      return [home, 'OK'];
    });
  }

  // Banners
  createBanner(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await BannerService.create(req.body);
      return [result, 'Banner created', 201];
    });
  }

  listBanners(req, res) {
    return handleApiRequest(req, res, async () =>
      BannerService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 50),
        placement: req.query.placement,
      })
    );
  }

  updateBanner(req, res) {
    return handleApiRequest(req, res, async () =>
      BannerService.update(req.params.id, req.body)
    );
  }

  removeBanner(req, res) {
    return handleApiRequest(req, res, async () =>
      BannerService.remove(req.params.id)
    );
  }

  // Home sections
  createSection(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await HomeService.createSection(req.body);
      return [result, 'Section created', 201];
    });
  }

  listSections(req, res) {
    return handleApiRequest(req, res, async () => HomeService.listAdmin());
  }

  updateSection(req, res) {
    return handleApiRequest(req, res, async () =>
      HomeService.updateSection(req.params.id, req.body)
    );
  }

  reorderSections(req, res) {
    return handleApiRequest(req, res, async () =>
      HomeService.reorder(req.body.items)
    );
  }

  removeSection(req, res) {
    return handleApiRequest(req, res, async () =>
      HomeService.removeSection(req.params.id)
    );
  }

  // Pages
  createPage(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await PageService.create(req.body);
      return [result, 'Page created', 201];
    });
  }

  listPagesAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      PageService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 50),
      })
    );
  }

  listPagesPublic(req, res) {
    return handleApiRequest(req, res, async () => PageService.listPublic());
  }

  getPage(req, res) {
    return handleApiRequest(req, res, async () =>
      PageService.getBySlug(req.params.slug)
    );
  }

  updatePage(req, res) {
    return handleApiRequest(req, res, async () =>
      PageService.update(req.params.id, req.body)
    );
  }

  removePage(req, res) {
    return handleApiRequest(req, res, async () =>
      PageService.remove(req.params.id)
    );
  }

  // FAQs
  listFaqsPublic(req, res) {
    return handleApiRequest(req, res, async () => FaqService.listPublic());
  }

  createFaqCategory(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await FaqService.createCategory(req.body);
      return [result, 'FAQ category created', 201];
    });
  }

  listFaqCategories(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.listCategoriesAdmin()
    );
  }

  updateFaqCategory(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.updateCategory(req.params.id, req.body)
    );
  }

  removeFaqCategory(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.removeCategory(req.params.id)
    );
  }

  createFaq(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await FaqService.createFaq(req.body);
      return [result, 'FAQ created', 201];
    });
  }

  listFaqsAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.listFaqsAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 100),
      })
    );
  }

  updateFaq(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.updateFaq(req.params.id, req.body)
    );
  }

  removeFaq(req, res) {
    return handleApiRequest(req, res, async () =>
      FaqService.removeFaq(req.params.id)
    );
  }

  // Inquiries
  createInquiry(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await InquiryService.create(req.body);
      return [result, 'Inquiry submitted', 201];
    });
  }

  listInquiries(req, res) {
    return handleApiRequest(req, res, async () =>
      InquiryService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 50),
        status: req.query.status,
        type: req.query.type,
      })
    );
  }

  updateInquiry(req, res) {
    return handleApiRequest(req, res, async () =>
      InquiryService.update(req.params.id, req.body)
    );
  }

  // Newsletter
  subscribe(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await NewsletterService.subscribe(req.body);
      return [result, result.message || 'Subscribed'];
    });
  }

  unsubscribe(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await NewsletterService.unsubscribe(req.body);
      return [result, result.message || 'Unsubscribed'];
    });
  }

  listNewsletter(req, res) {
    return handleApiRequest(req, res, async () =>
      NewsletterService.listAdmin({
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 100),
        activeOnly: req.query.activeOnly !== 'false',
      })
    );
  }

  // Wishlist
  getWishlist(req, res) {
    return handleApiRequest(req, res, async () =>
      WishlistService.list(req.userId)
    );
  }

  addWishlist(req, res) {
    return handleApiRequest(req, res, async () =>
      WishlistService.add(req.userId, req.params.productId)
    );
  }

  removeWishlist(req, res) {
    return handleApiRequest(req, res, async () =>
      WishlistService.remove(req.userId, req.params.productId)
    );
  }

  moveWishlistToCart(req, res) {
    return handleApiRequest(req, res, async () =>
      WishlistService.moveToCart(req.userId, req.body)
    );
  }

  // Store settings
  getStoreSettings(req, res) {
    return handleApiRequest(req, res, async () =>
      StoreSettingsService.getPublic()
    );
  }

  getStoreSettingsAdmin(req, res) {
    return handleApiRequest(req, res, async () =>
      StoreSettingsService.getAdmin()
    );
  }

  updateStoreSettings(req, res) {
    return handleApiRequest(req, res, async () =>
      StoreSettingsService.update(req.body)
    );
  }
}

export default new CmsController();
