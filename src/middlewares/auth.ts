import { createMiddleware } from "hono/factory";
import type { userTable } from "../db/schema.ts";
import { hashApiKey } from "../lib/crypto.ts";
import { db } from "../db/db.ts";

export type ApiKeyEnv = {
  Variables: {
    apiKeyUser: Pick<typeof userTable.$inferSelect, "id" | "role" | "email">;
  };
};

export const apiKeyAuth = createMiddleware<ApiKeyEnv>(async (c, next) => {
  const key = c.req.header("X-API-KEY");
  if (key == null || key.trim() == "") {
    return c.json({ error: "Missing API key" }, 401);
  }

  const keyHash = hashApiKey(key);
  const apiKey = await db.query.apiKeyTable.findFirst({ where: { keyHash } });

  if (!apiKey) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  const user = await db.query.userTable.findFirst({
    where: { id: apiKey.userId },
    columns: { id: true, email: true, role: true },
  });

  if (!user) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  c.set("apiKeyUser", user);
  await next();
});
