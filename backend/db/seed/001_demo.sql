insert into tenants (id, name, industry, city, plan)
values ('00000000-0000-0000-0000-000000000001', 'Кровля Север', 'Кровля', 'Москва', 'mvp')
on conflict do nothing;

-- Demo password for both users: KaskitDemo2026!
insert into users (id, email, full_name, password_hash, status, is_kaskit_staff, two_factor_required)
values
  ('00000000-0000-0000-0000-000000000010', 'owner@example.com', 'Владелец Кровля Север', '$2a$12$19WyQKjgMxer8wPwoVEIVeDvFffnLjUD585vB/P/iHukYYyx3Zpnu', 'active', false, false),
  ('00000000-0000-0000-0000-000000000011', 'admin@kaskit.ru', 'KASKIT Admin', '$2a$12$19WyQKjgMxer8wPwoVEIVeDvFffnLjUD585vB/P/iHukYYyx3Zpnu', 'active', true, true)
on conflict do nothing;

insert into tenant_memberships (tenant_id, user_id, role)
values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'owner')
on conflict do nothing;

insert into projects (id, tenant_id, name, business_name, website_url, project_key)
values (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Основной сайт',
  'Кровля Север',
  'https://example.com',
  'PROJECT-DEMO'
)
on conflict do nothing;
