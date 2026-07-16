import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';

import logger from './utilities/logger.js';

import healthRoutes from './routes/health.routes.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import addressRoutes from './routes/address.routes.js';
import cartRoutes from './routes/cart.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import {
  categoryPublicRoutes,
  categoryAdminRoutes,
} from './routes/category.routes.js';
import {
  collectionPublicRoutes,
  collectionAdminRoutes,
} from './routes/collection.routes.js';
import {
  productPublicRoutes,
  productAdminRoutes,
} from './routes/product.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import {
  checkoutRouter,
  orderRouter,
  adminOrderRouter,
  shippingRouter,
  couponPublicRouter,
  couponAdminRouter,
} from './routes/commerce.routes.js';
import {
  homePublicRouter,
  pagesPublicRouter,
  faqsPublicRouter,
  contactRouter,
  inquiriesPublicRouter,
  newsletterPublicRouter,
  storePublicRouter,
  wishlistRouter,
  bannersAdminRouter,
  homeSectionsAdminRouter,
  pagesAdminRouter,
  faqsAdminRouter,
  inquiriesAdminRouter,
  newsletterAdminRouter,
  settingsAdminRouter,
} from './routes/cms.routes.js';
import { reviewsAdminRouter } from './routes/review.routes.js';
import { shippingZonesAdminRouter } from './routes/shippingZone.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp({ quiet = false } = {}) {
  const app = express();

  if (!quiet) {
    app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url === '/favicon.ico',
        },
        serializers: {
          req: () => undefined,
          res: () => undefined,
        },
        customSuccessMessage: (req, res) =>
          `${req.method} ${req.url} ${res.statusCode}`,
      })
    );
  }

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
    })
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.use(
    express.json({
      limit: '2mb',
      verify: (req, _res, buf) => {
        if (req.originalUrl?.startsWith('/api/v1/webhooks')) {
          req.rawBody = buf.toString('utf8');
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/addresses', addressRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/checkout', checkoutRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/admin/orders', adminOrderRouter);
  app.use('/api/v1/shipping', shippingRouter);
  app.use('/api/v1/coupons', couponPublicRouter);
  app.use('/api/v1/admin/coupons', couponAdminRouter);
  app.use('/api/v1/webhooks', webhookRoutes);
  app.use('/api/v1/categories', categoryPublicRoutes);
  app.use('/api/v1/admin/categories', categoryAdminRoutes);
  app.use('/api/v1/collections', collectionPublicRoutes);
  app.use('/api/v1/admin/collections', collectionAdminRoutes);
  app.use('/api/v1/products', productPublicRoutes);
  app.use('/api/v1/admin/products', productAdminRoutes);
  app.use('/api/v1/upload', uploadRoutes);

  app.use('/api/v1/home', homePublicRouter);
  app.use('/api/v1/pages', pagesPublicRouter);
  app.use('/api/v1/faqs', faqsPublicRouter);
  app.use('/api/v1/contact', contactRouter);
  app.use('/api/v1/inquiries', inquiriesPublicRouter);
  app.use('/api/v1/newsletter', newsletterPublicRouter);
  app.use('/api/v1/store', storePublicRouter);
  app.use('/api/v1/wishlist', wishlistRouter);
  app.use('/api/v1/admin/banners', bannersAdminRouter);
  app.use('/api/v1/admin/home-sections', homeSectionsAdminRouter);
  app.use('/api/v1/admin/pages', pagesAdminRouter);
  app.use('/api/v1/admin/faqs', faqsAdminRouter);
  app.use('/api/v1/admin/inquiries', inquiriesAdminRouter);
  app.use('/api/v1/admin/newsletter', newsletterAdminRouter);
  app.use('/api/v1/admin/settings', settingsAdminRouter);
  app.use('/api/v1/admin/reviews', reviewsAdminRouter);
  app.use('/api/v1/admin/shipping/zones', shippingZonesAdminRouter);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
}

export default createApp;
