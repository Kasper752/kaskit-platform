import { query } from "../db/pool.js";

export async function auditLog(input: {
  actorUserId?: string | null;
  tenantId?: string | null;
  projectId?: string | null;
  action: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await query(
    `insert into audit_log (actor_user_id, tenant_id, project_id, action, reason, metadata)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      input.actorUserId ?? null,
      input.tenantId ?? null,
      input.projectId ?? null,
      input.action,
      input.reason ?? null,
      JSON.stringify(input.metadata ?? {})
    ]
  );
}
