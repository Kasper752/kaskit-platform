import { query } from "../db/pool.js";

type UpsertLeadInput = {
  tenantId: string;
  projectId: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  messenger?: string | null;
  service?: string | null;
  city?: string | null;
  source?: string | null;
  message?: string | null;
  potentialValue?: number | null;
  utm?: Record<string, unknown>;
};

export async function createOrUpdateContactLead(input: UpsertLeadInput) {
  const contactResult = await query<{ id: string }>(
    `insert into contacts (tenant_id, project_id, name, phone, email, messenger, source, city)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (tenant_id, phone)
     where phone is not null
     do update set
       name = coalesce(excluded.name, contacts.name),
       email = coalesce(excluded.email, contacts.email),
       messenger = coalesce(excluded.messenger, contacts.messenger),
       source = coalesce(excluded.source, contacts.source),
       city = coalesce(excluded.city, contacts.city),
       updated_at = now()
     returning id`,
    [
      input.tenantId,
      input.projectId,
      input.contactName ?? null,
      input.phone ?? null,
      input.email ?? null,
      input.messenger ?? null,
      input.source ?? "website",
      input.city ?? null
    ]
  );

  const contactId = contactResult.rows[0].id;
  const leadResult = await query<{ id: string }>(
    `insert into leads (tenant_id, project_id, contact_id, title, service, city, source, potential_value, status)
     values ($1, $2, $3, $4, $5, $6, $7, $8, 'new')
     returning id`,
    [
      input.tenantId,
      input.projectId,
      contactId,
      input.service ? `${input.service}: ${input.contactName ?? input.phone ?? "новое обращение"}` : "Новое обращение",
      input.service ?? null,
      input.city ?? null,
      input.source ?? "website",
      input.potentialValue ?? null
    ]
  );

  const leadId = leadResult.rows[0].id;

  await query(
    `insert into interactions (tenant_id, project_id, contact_id, lead_id, type, direction, body, metadata)
     values ($1, $2, $3, $4, 'form', 'inbound', $5, $6)`,
    [input.tenantId, input.projectId, contactId, leadId, input.message ?? null, JSON.stringify({ utm: input.utm ?? {} })]
  );

  return { contactId, leadId };
}
