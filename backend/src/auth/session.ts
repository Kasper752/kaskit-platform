import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyReply } from "fastify";
import { config } from "../config.js";
import { query } from "../db/pool.js";

const SESSION_TTL_DAYS = 30;

function sign(token: string) {
  return createHmac("sha256", config.sessionSecret).update(token).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function encodeSessionCookie(token: string) {
  return `${token}.${sign(token)}`;
}

export function decodeSessionCookie(cookieValue?: string) {
  if (!cookieValue) return null;
  const [token, signature] = cookieValue.split(".");
  if (!token || !signature) return null;
  return safeEqual(sign(token), signature) ? token : null;
}

export async function createSession(userId: string, reply: FastifyReply, meta: { ip?: string; userAgent?: string }) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sign(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `insert into sessions (user_id, token_hash, ip_address, user_agent, expires_at)
     values ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, meta.ip ?? null, meta.userAgent ?? null, expiresAt]
  );

  reply.setCookie(config.sessionCookieName, encodeSessionCookie(token), {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession(cookieValue: string | undefined, reply: FastifyReply) {
  const token = decodeSessionCookie(cookieValue);
  if (token) {
    await query("delete from sessions where token_hash = $1", [sign(token)]);
  }

  reply.clearCookie(config.sessionCookieName, { path: "/" });
}

export async function destroyAllUserSessions(userId: string) {
  await query("delete from sessions where user_id = $1", [userId]);
}

export async function findSessionUser(cookieValue?: string) {
  const token = decodeSessionCookie(cookieValue);
  if (!token) return null;

  const result = await query<{
    id: string;
    email: string;
    full_name: string | null;
    is_kaskit_staff: boolean;
    role: string | null;
    tenant_id: string | null;
  }>(
    `select u.id, u.email, u.full_name, u.is_kaskit_staff, tm.role, tm.tenant_id
       from sessions s
       join users u on u.id = s.user_id
       left join tenant_memberships tm on tm.user_id = u.id
      where s.token_hash = $1
        and s.expires_at > now()
      order by tm.created_at asc
      limit 1`,
    [sign(token)]
  );

  return result.rows[0] ?? null;
}
