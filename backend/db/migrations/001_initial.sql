create extension if not exists "pgcrypto";
create extension if not exists citext;

create type user_status as enum ('invited', 'active', 'disabled');
create type tenant_role as enum ('owner', 'manager', 'viewer', 'kaskit_admin', 'kaskit_support');
create type lead_status as enum ('new', 'contacted', 'estimate_needed', 'estimate_sent', 'thinking', 'won', 'lost', 'archived');
create type interaction_type as enum ('form', 'chat', 'call', 'missed_call', 'sms_inbound', 'sms_outbound', 'telegram', 'whatsapp', 'note');
create type interaction_direction as enum ('inbound', 'outbound', 'internal');
create type event_type as enum ('visit', 'phone_click', 'telegram_click', 'whatsapp_click', 'form_submit', 'chat_message');
create type integration_status as enum ('not_connected', 'connected', 'error', 'paused');

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  industry text,
  city text,
  plan text not null default 'mvp',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  phone text,
  full_name text,
  password_hash text not null,
  status user_status not null default 'invited',
  is_kaskit_staff boolean not null default false,
  two_factor_required boolean not null default false,
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tenant_memberships (
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role tenant_role not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  email text,
  ip_address text,
  user_agent text,
  result text not null,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  business_name text not null,
  website_url text,
  project_key text not null unique,
  timezone text not null default 'Europe/Moscow',
  status text not null default 'active',
  auto_sms_enabled boolean not null default false,
  auto_sms_template text not null default 'Здравствуйте! Вы звонили в {{businessName}}. Сейчас не смогли ответить. Напишите сюда или оставьте заявку: {{link}}. Мы скоро свяжемся.',
  auto_sms_delay_seconds int not null default 45,
  auto_sms_quiet_hours jsonb not null default '{"from":"21:00","to":"09:00"}',
  auto_sms_repeat_after_hours int not null default 24,
  sms_monthly_limit int not null default 300,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text,
  phone text,
  email text,
  messenger text,
  city text,
  source text,
  pii_deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index contacts_tenant_phone_unique on contacts(tenant_id, phone) where phone is not null;
create index contacts_tenant_idx on contacts(tenant_id);

create table leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  contact_id uuid not null references contacts(id) on delete cascade,
  owner_user_id uuid references users(id) on delete set null,
  title text not null,
  service text,
  city text,
  source text,
  status lead_status not null default 'new',
  potential_value numeric(12, 2),
  next_touch_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_tenant_status_idx on leads(tenant_id, status);
create index leads_next_touch_idx on leads(tenant_id, next_touch_at);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  type interaction_type not null,
  direction interaction_direction not null,
  body text,
  external_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index interactions_tenant_created_idx on interactions(tenant_id, created_at desc);
create index interactions_lead_idx on interactions(lead_id, created_at desc);

create table events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  type event_type not null,
  visitor_id text,
  page_url text,
  referrer text,
  source text,
  utm jsonb not null default '{}',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index events_tenant_type_created_idx on events(tenant_id, type, created_at desc);
create index events_project_created_idx on events(project_id, created_at desc);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  provider text not null,
  kind text not null,
  status integration_status not null default 'not_connected',
  settings jsonb not null default '{}',
  last_error text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table support_access_grants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  requested_by_user_id uuid references users(id) on delete set null,
  granted_to_user_id uuid references users(id) on delete set null,
  reason text not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  action text not null,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index audit_tenant_created_idx on audit_log(tenant_id, created_at desc);
create index audit_action_idx on audit_log(action, created_at desc);
