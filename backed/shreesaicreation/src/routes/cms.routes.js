import express from 'express';
import CmsController from '../controllers/cms.controller.js';
import AuthJwt from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bannerSchema,
  bannerUpdateSchema,
  homeSectionSchema,
  homeSectionUpdateSchema,
  homeReorderSchema,
  pageSchema,
  pageUpdateSchema,
  faqCategorySchema,
  faqSchema,
  faqUpdateSchema,
  inquirySchema,
  inquiryUpdateSchema,
  newsletterSchema,
  wishlistMoveSchema,
  storeSettingsUpdateSchema,
} from '../validators/cms.validator.js';

// ——— Public ———
export const homePublicRouter = express.Router();
homePublicRouter.get('/', CmsController.getHome);

export const pagesPublicRouter = express.Router();
pagesPublicRouter.get('/', CmsController.listPagesPublic);
pagesPublicRouter.get('/:slug', CmsController.getPage);

export const faqsPublicRouter = express.Router();
faqsPublicRouter.get('/', CmsController.listFaqsPublic);

export const contactRouter = express.Router();
contactRouter.post('/', validate(inquirySchema), CmsController.createInquiry);

export const inquiriesPublicRouter = express.Router();
inquiriesPublicRouter.post(
  '/',
  validate(inquirySchema),
  CmsController.createInquiry
);

export const newsletterPublicRouter = express.Router();
newsletterPublicRouter.post(
  '/subscribe',
  validate(newsletterSchema),
  CmsController.subscribe
);
newsletterPublicRouter.post(
  '/unsubscribe',
  validate(newsletterSchema),
  CmsController.unsubscribe
);

export const storePublicRouter = express.Router();
storePublicRouter.get('/settings', CmsController.getStoreSettings);

export const wishlistRouter = express.Router();
wishlistRouter.use(AuthJwt.verifyUser);
wishlistRouter.get('/', CmsController.getWishlist);
wishlistRouter.post(
  '/move-to-cart',
  validate(wishlistMoveSchema),
  CmsController.moveWishlistToCart
);
wishlistRouter.post('/:productId', CmsController.addWishlist);
wishlistRouter.delete('/:productId', CmsController.removeWishlist);

// ——— Admin ———
export const bannersAdminRouter = express.Router();
bannersAdminRouter.use(AuthJwt.verifyAdmin);
bannersAdminRouter.get('/', AuthJwt.hasPermission('Banners'), CmsController.listBanners);
bannersAdminRouter.post(
  '/',
  AuthJwt.hasPermission('Banners'),
  validate(bannerSchema),
  CmsController.createBanner
);
bannersAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Banners'),
  validate(bannerUpdateSchema),
  CmsController.updateBanner
);
bannersAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Banners'),
  CmsController.removeBanner
);

export const homeSectionsAdminRouter = express.Router();
homeSectionsAdminRouter.use(AuthJwt.verifyAdmin);
homeSectionsAdminRouter.get(
  '/',
  AuthJwt.hasPermission('HomeSections'),
  CmsController.listSections
);
homeSectionsAdminRouter.post(
  '/',
  AuthJwt.hasPermission('HomeSections'),
  validate(homeSectionSchema),
  CmsController.createSection
);
homeSectionsAdminRouter.patch(
  '/reorder',
  AuthJwt.hasPermission('HomeSections'),
  validate(homeReorderSchema),
  CmsController.reorderSections
);
homeSectionsAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('HomeSections'),
  validate(homeSectionUpdateSchema),
  CmsController.updateSection
);
homeSectionsAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('HomeSections'),
  CmsController.removeSection
);

export const pagesAdminRouter = express.Router();
pagesAdminRouter.use(AuthJwt.verifyAdmin);
pagesAdminRouter.get('/', AuthJwt.hasPermission('Pages'), CmsController.listPagesAdmin);
pagesAdminRouter.post(
  '/',
  AuthJwt.hasPermission('Pages'),
  validate(pageSchema),
  CmsController.createPage
);
pagesAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Pages'),
  validate(pageUpdateSchema),
  CmsController.updatePage
);
pagesAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Pages'),
  CmsController.removePage
);

export const faqsAdminRouter = express.Router();
faqsAdminRouter.use(AuthJwt.verifyAdmin);
faqsAdminRouter.get(
  '/categories',
  AuthJwt.hasPermission('Faqs'),
  CmsController.listFaqCategories
);
faqsAdminRouter.post(
  '/categories',
  AuthJwt.hasPermission('Faqs'),
  validate(faqCategorySchema),
  CmsController.createFaqCategory
);
faqsAdminRouter.patch(
  '/categories/:id',
  AuthJwt.hasPermission('Faqs'),
  CmsController.updateFaqCategory
);
faqsAdminRouter.delete(
  '/categories/:id',
  AuthJwt.hasPermission('Faqs'),
  CmsController.removeFaqCategory
);
faqsAdminRouter.get('/', AuthJwt.hasPermission('Faqs'), CmsController.listFaqsAdmin);
faqsAdminRouter.post(
  '/',
  AuthJwt.hasPermission('Faqs'),
  validate(faqSchema),
  CmsController.createFaq
);
faqsAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Faqs'),
  validate(faqUpdateSchema),
  CmsController.updateFaq
);
faqsAdminRouter.delete(
  '/:id',
  AuthJwt.hasPermission('Faqs'),
  CmsController.removeFaq
);

export const inquiriesAdminRouter = express.Router();
inquiriesAdminRouter.use(AuthJwt.verifyAdmin);
inquiriesAdminRouter.get(
  '/',
  AuthJwt.hasPermission('Inquiries'),
  CmsController.listInquiries
);
inquiriesAdminRouter.patch(
  '/:id',
  AuthJwt.hasPermission('Inquiries'),
  validate(inquiryUpdateSchema),
  CmsController.updateInquiry
);

export const newsletterAdminRouter = express.Router();
newsletterAdminRouter.use(AuthJwt.verifyAdmin);
newsletterAdminRouter.get(
  '/',
  AuthJwt.hasPermission('Newsletter'),
  CmsController.listNewsletter
);

export const settingsAdminRouter = express.Router();
settingsAdminRouter.use(AuthJwt.verifyAdmin);
settingsAdminRouter.get(
  '/',
  AuthJwt.hasPermission('Settings'),
  CmsController.getStoreSettingsAdmin
);
settingsAdminRouter.patch(
  '/',
  AuthJwt.hasPermission('Settings'),
  validate(storeSettingsUpdateSchema),
  CmsController.updateStoreSettings
);
