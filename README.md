# Shree Sai Creation

Premium, data-driven frontend for a luxury chandelier and decorative lighting brand.

## Run locally

```bash
npm install
npm run dev
```

## Dynamic-content architecture

All page content flows through `lib/content-repository.ts`. The current repository reads typed mock data from `data/site-data.ts`; when the backend is ready, replace only the repository methods with database/CMS/API queries. Page and UI components can remain unchanged.

Available frontend API contracts:

- `GET /api/site` — site settings, navigation and FAQs
- `GET /api/categories`
- `GET /api/products?q=&category=&style=&space=`
- `GET /api/products/[slug]`
- `GET /api/projects?type=`
- `GET /api/posts`
- `POST /api/inquiries` — validated inquiry payload, ready to connect to a CRM/database

## Routes

`/`, `/about`, `/collections`, `/collections/[slug]`, `/projects`, `/bespoke`, `/blog`, `/blog/[slug]`, `/contact`, and a custom 404 state.
