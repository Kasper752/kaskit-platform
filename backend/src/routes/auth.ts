import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyPassword } from "../auth/password.js";
import { createSession, destroyAllUserSessions, destroySession } from "../auth/session.js";
import { config } from "../config.js";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { auditLog } from "../services/audit.js";

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await query<{ id: string; email: string; password_hash: string; two_factor_required: boolean }>(
      "select id, email, password_hash, two_factor_required from users where email = $1 and status = 'active'",
      [body.email]
    );

    const user = result.rows[0];
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      await auditLog({ action: "auth.login_failed", metadata: { email: body.email, ip: request.ip } });
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    if (user.two_factor_required) {
      await auditLog({ actorUserId: user.id, action: "auth.2fa_required", metadata: { email: user.email } });
      return reply.code(202).send({ requiresTwoFactor: true });
    }

    await createSession(user.id, reply, {
      ip: request.ip,
      userAgent: Array.isArray(request.headers["user-agent"])
        ? request.headers["user-agent"].join(" ")
        : request.headers["user-agent"]
    });
    await auditLog({ actorUserId: user.id, action: "auth.login", metadata: { ip: request.ip } });

    return reply.send({ ok: true });
  });

  app.post("/api/auth/logout", { preHandler: requireAuth }, async (request, reply) => {
    await destroySession(request.cookies?.[config.sessionCookieName], reply);
    await auditLog({ actorUserId: request.user?.id, tenantId: request.user?.tenant_id, action: "auth.logout" });
    return reply.send({ ok: true });
  });

  app.post("/api/auth/logout-all", { preHandler: requireAuth }, async (request, reply) => {
    await destroyAllUserSessions(request.user!.id);
    reply.clearCookie(config.sessionCookieName, { path: "/" });
    await auditLog({ actorUserId: request.user?.id, tenantId: request.user?.tenant_id, action: "auth.logout_all" });
    return reply.send({ ok: true });
  });

  app.get("/api/auth/me", { preHandler: requireAuth }, async (request) => {
    return { user: request.user };
  });
}
