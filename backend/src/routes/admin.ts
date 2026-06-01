import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, requireKaskitStaff } from "../middleware/auth.js";
import { auditLog } from "../services/audit.js";

const tenantSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  plan: z.string().default("mvp")
});

const projectSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(2),
  websiteUrl: z.string().url().optional(),
  businessName: z.string().min(2),
  timezone: z.string().default("Europe/Moscow")
});

export async function adminRoutes(app: FastifyInstance) {
  const adminGuard = [requireAuth, requireKaskitStaff];

  app.get("/api/admin/tenants", { preHandler: adminGuard }, async () => {
    const result = await query<{ id: string }>(
      `select t.*,
              count(distinct p.id)::int as projects_count,
              count(distinct tm.user_id)::int as users_count
         from tenants t
         left join projects p on p.tenant_id = t.id
         left join tenant_memberships tm on tm.tenant_id = t.id
        group by t.id
        order by t.created_at desc`
    );
    return { tenants: result.rows };
  });

  app.post("/api/admin/tenants", { preHandler: adminGuard }, async (request) => {
    const body = tenantSchema.parse(request.body);
    const result = await query<{ id: string }>(
      `insert into tenants (name, legal_name, industry, city, plan)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [body.name, body.legalName ?? null, body.industry ?? null, body.city ?? null, body.plan]
    );

    await auditLog({
      actorUserId: request.user!.id,
      action: "admin.tenant_created",
      tenantId: result.rows[0].id,
      metadata: body
    });

    return { tenant: result.rows[0] };
  });

  app.get("/api/admin/projects", { preHandler: adminGuard }, async () => {
    const result = await query(
      `select p.*, t.name as tenant_name
         from projects p
         join tenants t on t.id = p.tenant_id
        order by p.created_at desc`
    );
    return { projects: result.rows };
  });

  app.post("/api/admin/projects", { preHandler: adminGuard }, async (request) => {
    const body = projectSchema.parse(request.body);
    const projectKey = `PROJECT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const result = await query(
      `insert into projects (tenant_id, name, website_url, business_name, timezone, project_key)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [body.tenantId, body.name, body.websiteUrl ?? null, body.businessName, body.timezone, projectKey]
    );

    await auditLog({
      actorUserId: request.user!.id,
      tenantId: body.tenantId,
      projectId: result.rows[0].id,
      action: "admin.project_created",
      metadata: { projectKey }
    });

    return { project: result.rows[0] };
  });

  app.post("/api/admin/projects/:id/invite", { preHandler: adminGuard }, async (request) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({ email: z.string().email(), role: z.enum(["owner", "manager", "viewer"]) }).parse(request.body);

    await auditLog({
      actorUserId: request.user!.id,
      projectId: params.id,
      action: "admin.project_invite_created",
      metadata: body
    });

    return { ok: true, invite: { projectId: params.id, email: body.email, role: body.role } };
  });

  app.get("/api/admin/audit-log", { preHandler: adminGuard }, async () => {
    const result = await query(
      `select al.*, u.email as actor_email, t.name as tenant_name, p.name as project_name
         from audit_log al
         left join users u on u.id = al.actor_user_id
         left join tenants t on t.id = al.tenant_id
         left join projects p on p.id = al.project_id
        order by al.created_at desc
        limit 300`
    );

    return { items: result.rows };
  });
}
