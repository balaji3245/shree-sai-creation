# Shree Sai Creation API

Premium luxury lighting & chandelier e-commerce backend (Phase 0 + Phase 1).

## Quick start

```bash
cp .env.example .env.dev
# ensure MongoDB is running
npm install
npm run dev
```

Default API base: `http://localhost:5050/api/v1`

Seeded admin (auto on boot):

- Email: `admin@shreesaicreation.com`
- Password: `Admin@12345`

## Architecture

```
Controller → Service → Repository → Model
```

See `implementation.md` and `docs/PHASE_0_1_IMPLEMENTATION.md`.
