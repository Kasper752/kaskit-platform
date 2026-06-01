import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config.js";
import { findSessionUser } from "../auth/session.js";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_kaskit_staff: boolean;
  role: string | null;
  tenant_id: string | null;
};

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const user = await findSessionUser(request.cookies?.[config.sessionCookieName]);
  if (!user) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  request.user = user;
}

export function requireTenant(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user?.tenant_id) {
    reply.code(403).send({ error: "Tenant context is required" });
    return;
  }
}

export function requireKaskitStaff(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user?.is_kaskit_staff) {
    reply.code(403).send({ error: "KASKIT staff role is required" });
    return;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
