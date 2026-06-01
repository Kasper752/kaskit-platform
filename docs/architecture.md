# KASKIT Platform Architecture

## Product Boundary

KASKIT Platform is independent from the agency landing website.

- `kaskit-tech.ru`: public agency website.
- `app.kaskit.ru`: SaaS platform for clients and KASKIT staff.

The platform owns client authentication, tenants, projects, leads, contacts, interactions, analytics events, integrations, support access, and audit logs.

## Core Model

- `tenants`: client organizations.
- `projects`: websites, funnels, or service lines inside a tenant.
- `users`: client users and KASKIT staff.
- `tenant_memberships`: user roles per tenant.
- `contacts`: real people who contacted a contractor.
- `leads`: active CRM opportunities tied to contacts.
- `interactions`: all touches such as forms, chat, calls, SMS, Telegram, WhatsApp, notes.
- `events`: analytics signals such as visits, phone clicks, messenger clicks, and form submits.
- `integrations`: telephony, SMS, Telegram, WhatsApp, Avito, CRM connectors.
- `support_access_grants`: time-boxed support access from a client to KASKIT.
- `audit_log`: immutable action trail.

Every tenant-owned query must be scoped by `tenant_id`. Public ingestion resolves `project_key` first, then writes through the owning `tenant_id`.

## Access Zones

Client cabinet:

- Dashboard
- Inbox
- Leads / CRM
- Contacts
- Analytics
- Settings

KASKIT admin:

- Tenants and projects
- Project keys and widget status
- Integrations health
- Webhook errors
- SMS limits
- Support access requests/grants
- Audit log

KASKIT staff cannot freely browse client lead content. Production support access must be time-boxed, reasoned, and logged. Superadmin and support elevation require 2FA.

## MVP API

Public ingestion:

- `POST /api/public/event`
- `POST /api/public/lead`
- `POST /api/public/chat-message`
- `POST /api/public/call-click`

Webhooks:

- `POST /api/webhooks/telegram/:projectKey`
- `POST /api/webhooks/telephony/:provider/:projectKey`
- `POST /api/webhooks/sms/:provider`

Client API:

- `GET /api/dashboard`
- `GET /api/inbox`
- `GET /api/leads`
- `PATCH /api/leads/:id`
- `GET /api/contacts`
- `GET /api/analytics`
- `GET /api/settings`

Admin API:

- `GET /api/admin/tenants`
- `POST /api/admin/tenants`
- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `POST /api/admin/projects/:id/invite`
- `GET /api/admin/audit-log`

## Missed Call Auto-SMS Flow

1. A client receives a virtual number from Mango Office, UIS, Zadarma, Sipuni, Telfin, or another provider.
2. The provider sends a telephony webhook.
3. If call status is missed, the platform creates or updates a contact and lead.
4. The platform stores an interaction with type `missed_call`.
5. A delayed SMS job checks business hours, duplicate-send windows, monthly limits, and template settings.
6. The SMS provider sends the message.
7. The result is stored as an `sms_outbound` interaction and in SMS logs.

The MVP keeps provider boundaries explicit and stores integration settings, but actual telephony/SMS delivery can be added after the first widget and lead tracking release.

