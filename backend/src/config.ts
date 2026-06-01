import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "kaskit_session",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-session-secret-change-me",
  passwordMinLength: Number(process.env.PASSWORD_MIN_LENGTH ?? 10),
  isProduction: process.env.NODE_ENV === "production"
};

if (!config.databaseUrl) {
  console.warn("DATABASE_URL is not set. API routes that query PostgreSQL will fail until it is configured.");
}
