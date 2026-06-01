# KASKIT Platform

KASKIT Platform is a separate SaaS application for KASKIT clients. The agency website can stay on `kaskit-tech.ru`, while the client platform runs on `app.kaskit.ru`.

The product direction is KASKIT Hub: one place for leads, missed calls, form submissions, chat messages, client contacts, source analytics, and KASKIT support/admin workflows.

## MVP Scope

- Email/password authentication with secure session cookies.
- Multi-tenant data model for tenants, projects, users, contacts, leads, interactions, events, integrations, support access, and audit logs.
- Client dashboard, inbox, leads, contacts, analytics, and settings shell.
- KASKIT admin shell for tenants, projects, support access, integrations, and audit visibility.
- Public widget and public ingestion API for visits, form leads, chat messages, phone clicks, WhatsApp clicks, and Telegram clicks.
- PostgreSQL migrations prepared for production data ownership and tenant isolation.

## Structure

```text
kaskit-platform/
  frontend/      Next.js client/admin UI
  backend/       Fastify API, auth, tenant-scoped routes, public webhooks
  widget/        Lightweight script for customer websites
  docs/          Architecture and environment notes
```

## Local Setup

1. Copy `docs/env.example` into local `.env` files as needed.
2. Create a PostgreSQL database.
3. Run migrations from `backend/db/migrations`.
4. Install dependencies with `npm install`.
5. Start both apps:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Widget in production: `https://app.kaskit.ru/widget.js`

## Widget Install Snippet

```html
<script src="https://app.kaskit.ru/widget.js" data-project="PROJECT-123" async></script>
```

