import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireTenant } from "../middleware/auth.js";
import { auditLog } from "../services/audit.js";

const leadPatchSchema = z.object({
  status: z.enum(["new", "contacted", "estimate_needed", "estimate_sent", "thinking", "won", "lost", "archived"]).optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  nextTouchAt: z.string().datetime().nullable().optional(),
  potentialValue: z.number().nullable().optional(),
  note: z.string().max(2000).optional()
});

export async function clientRoutes(app: FastifyInstance) {
  const tenantGuard = [requireAuth, requireTenant];

  app.get("/api/dashboard", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const result = await query(
      `select
        count(*) filter (where l.created_at >= date_trunc('day', now()))::int as leads_today,
        count(*) filter (where l.created_at >= now() - interval '7 days')::int as leads_week,
        count(*) filter (where l.created_at >= now() - interval '30 days')::int as leads_month,
        count(*) filter (where l.status = 'new')::int as new_leads,
        count(*) filter (where l.next_touch_at < now() and l.status not in ('won', 'lost', 'archived'))::int as overdue_leads,
        coalesce(sum(l.potential_value), 0)::int as pipeline_value
       from leads l
       where l.tenant_id = $1`,
      [tenantId]
    );

    const eventResult = await query(
      `select type, count(*)::int as count
         from events
        where tenant_id = $1 and created_at >= now() - interval '30 days'
        group by type`,
      [tenantId]
    );

    return { summary: result.rows[0], events: eventResult.rows };
  });

  app.get("/api/inbox", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const result = await query(
      `select i.*, c.name as contact_name, c.phone, c.email, l.status as lead_status
         from interactions i
         left join contacts c on c.id = i.contact_id
         left join leads l on l.id = i.lead_id
        where i.tenant_id = $1
        order by i.created_at desc
        limit 100`,
      [tenantId]
    );

    return { items: result.rows };
  });

  app.get("/api/leads", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const result = await query(
      `select l.*, c.name as contact_name, c.phone, c.email, c.messenger
         from leads l
         join contacts c on c.id = l.contact_id
        where l.tenant_id = $1
        order by l.created_at desc
        limit 200`,
      [tenantId]
    );

    return { leads: result.rows };
  });

  app.patch("/api/leads/:id", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = leadPatchSchema.parse(request.body);

    const result = await query(
      `update leads
          set status = coalesce($3, status),
              owner_user_id = coalesce($4, owner_user_id),
              next_touch_at = coalesce($5, next_touch_at),
              potential_value = coalesce($6, potential_value),
              updated_at = now()
        where id = $1 and tenant_id = $2
        returning *`,
      [
        params.id,
        tenantId,
        body.status ?? null,
        body.ownerUserId ?? null,
        body.nextTouchAt ?? null,
        body.potentialValue ?? null
      ]
    );

    if (body.note) {
      await query(
        `insert into interactions (tenant_id, lead_id, type, direction, body, metadata)
         values ($1, $2, 'note', 'internal', $3, '{}')`,
        [tenantId, params.id, body.note]
      );
    }

    await auditLog({
      actorUserId: request.user!.id,
      tenantId,
      action: "lead.updated",
      metadata: { leadId: params.id, changes: body }
    });

    return { lead: result.rows[0] };
  });

  app.get("/api/contacts", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const result = await query(
      `select c.*,
              count(l.id)::int as leads_count,
              max(i.created_at) as last_interaction_at
         from contacts c
         left join leads l on l.contact_id = c.id
         left join interactions i on i.contact_id = c.id
        where c.tenant_id = $1
        group by c.id
        order by coalesce(max(i.created_at), c.created_at) desc
        limit 200`,
      [tenantId]
    );

    return { contacts: result.rows };
  });

  app.get("/api/analytics", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const result = await query(
      `select date_trunc('day', created_at)::date as day, type, source, count(*)::int as count
         from events
        where tenant_id = $1 and created_at >= now() - interval '30 days'
        group by 1, 2, 3
        order by 1 asc`,
      [tenantId]
    );

    return { series: result.rows };
  });

  app.get("/api/settings", { preHandler: tenantGuard }, async (request) => {
    const tenantId = request.user!.tenant_id!;
    const projects = await query("select * from projects where tenant_id = $1 order by created_at desc", [tenantId]);
    const integrations = await query("select * from integrations where tenant_id = $1 order by provider asc", [tenantId]);
    return { projects: projects.rows, integrations: integrations.rows };
  });
}
