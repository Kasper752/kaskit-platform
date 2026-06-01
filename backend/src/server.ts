import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { readFile } from "node:fs/promises";
import { config } from "./config.js";
import { authRoutes } from "./routes/auth.js";
import { clientRoutes } from "./routes/client.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: [config.appOrigin, /https?:\/\/.*$/],
  credentials: true
});
await app.register(cookie);
await app.register(rateLimit, {
  max: 30,
  timeWindow: "1 minute",
  hook: "preHandler",
  allowList: ["127.0.0.1", "::1"]
});

app.get("/health", async () => ({ ok: true, service: "kaskit-platform-api" }));
app.get("/widget.js", async (_request, reply) => {
  const widget = await readFile(new URL("../../widget/widget.js", import.meta.url), "utf8");
  return reply.type("application/javascript; charset=utf-8").send(widget);
});

await app.register(authRoutes);
await app.register(clientRoutes);
await app.register(publicRoutes);
await app.register(adminRoutes);

await app.listen({ port: config.port, host: "0.0.0.0" });
