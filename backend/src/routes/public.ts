import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db/pool.js";
import { createOrUpdateContactLead } from "../services/leads.js";
import { auditLog } from "../services/audit.js";

const projectKeySchema = z.object({
  projectKey: z.string().min(6).max(80)
});

const eventSchema = projectKeySchema.extend({
  type: z.enum(["visit", "phone_click", "telegram_click", "whatsapp_click", "form_submit", "chat_message"]),
  pageUrl: z.string().url().optional(),
  referrer: z.string().optional(),
  source: z.string().optional(),
  utm: z.record(z.unknown()).optional(),
  visitorId: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

const leadSchema = projectKeySchema.extend({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  messenger: z.string().optional(),
  service: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  message: z.string().optional(),
  potentialValue: z.number().optional(),
  utm: z.record(z.unknown()).optional()
});

async function resolveProject(projectKey: string) {
  const result = await query<{ id: string; tenant_id: string; name: string }>(
    "select id, tenant_id, name from projects where project_key = $1 and status = 'active'",
    [projectKey]
  );
  return result.rows[0] ?? null;
}

export async function publicRoutes(app: FastifyInstance) {
  async function ingestLead(body: z.infer<typeof leadSchema>, defaultSource: string) {
    const project = await resolveProject(body.projectKey);
    if (!project) return null;

    const result = await createOrUpdateContactLead({
      tenantId: project.tenant_id,
      projectId: project.id,
      contactName: body.name,
      phone: body.phone,
      email: body.email,
      messenger: body.messenger,
      service: body.service,
      city: body.city,
      source: body.source ?? defaultSource,
      message: body.message,
      potentialValue: body.potentialValue,
      utm: body.utm
    });

    await auditLog({
      tenantId: project.tenant_id,
      projectId: project.id,
      action: "public.lead_created",
      metadata: result
    });

    return result;
  }

  app.post("/api/public/event", async (request, reply) => {
    const body = eventSchema.parse(request.body);
    const project = await resolveProject(body.projectKey);
    if (!project) return reply.code(404).send({ error: "Project not found" });

    await query(
      `insert into events (tenant_id, project_id, type, visitor_id, page_url, referrer, source, utm, metadata)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        project.tenant_id,
        project.id,
        body.type,
        body.visitorId ?? null,
        body.pageUrl ?? null,
        body.referrer ?? null,
        body.source ?? null,
        JSON.stringify(body.utm ?? {}),
        JSON.stringify(body.metadata ?? {})
      ]
    );

    return { ok: true };
  });

  app.post("/api/public/lead", async (request, reply) => {
    const body = leadSchema.parse(request.body);
    const result = await ingestLead(body, "form");
    if (!result) return reply.code(404).send({ error: "Project not found" });

    return { ok: true, leadId: result.leadId };
  });

  app.post("/api/public/chat-message", async (request, reply) => {
    const body = leadSchema.parse(request.body);
    const result = await ingestLead(body, "chat");
    if (!result) return reply.code(404).send({ error: "Project not found" });

    return { ok: true, leadId: result.leadId };
  });

  app.post("/api/public/call-click", async (request, reply) => {
    const body = eventSchema.extend({ phone: z.string().optional() }).parse({
      ...(request.body as object),
      type: "phone_click"
    });
    const project = await resolveProject(body.projectKey);
    if (!project) return reply.code(404).send({ error: "Project not found" });

    await query(
      `insert into events (tenant_id, project_id, type, visitor_id, page_url, referrer, source, utm, metadata)
       values ($1, $2, 'phone_click', $3, $4, $5, $6, $7, $8)`,
      [
        project.tenant_id,
        project.id,
        body.visitorId ?? null,
        body.pageUrl ?? null,
        body.referrer ?? null,
        body.source ?? null,
        JSON.stringify(body.utm ?? {}),
        JSON.stringify({ phone: body.phone ?? null, ...(body.metadata ?? {}) })
      ]
    );

    return { ok: true };
  });

  app.post("/api/webhooks/telegram/:projectKey", async (request, reply) => {
    const params = projectKeySchema.parse(request.params);
    const project = await resolveProject(params.projectKey);
    if (!project) return reply.code(404).send({ error: "Project not found" });

    await auditLog({
      tenantId: project.tenant_id,
      projectId: project.id,
      action: "webhook.telegram.received",
      metadata: { payload: request.body }
    });

    return { ok: true };
  });

  app.post("/api/webhooks/telephony/:provider/:projectKey", async (request, reply) => {
    const params = z.object({ provider: z.string(), projectKey: z.string() }).parse(request.params);
    const project = await resolveProject(params.projectKey);
    if (!project) return reply.code(404).send({ error: "Project not found" });

    await auditLog({
      tenantId: project.tenant_id,
      projectId: project.id,
      action: "webhook.telephony.received",
      metadata: { provider: params.provider, payload: request.body }
    });

    return { ok: true };
  });

  app.post("/api/webhooks/sms/:provider", async (request) => {
    const params = z.object({ provider: z.string() }).parse(request.params);
    await auditLog({
      action: "webhook.sms.received",
      metadata: { provider: params.provider, payload: request.body }
    });

    return { ok: true };
  });
}
