import { Hono } from "hono";
import { db } from "../db/db.ts";
import { jwt } from "hono/jwt";
import { env } from "../data/env.ts";
import { sValidator } from "@hono/standard-validator";
import z from "zod";
import { generateApiKey } from "../lib/crypto.ts";
import { apiKeyTable } from "../db/schema.ts";
import { and, eq } from "drizzle-orm";

type JwtEnv = {
  Variables: {
    jwtPayload: { sub: string; email: string; exp: number };
  };
};

const app = new Hono<JwtEnv>();

app.use(jwt({ secret: env.JWT_SECRET, alg: "HS256" }));

const createKeySchema = z.object({
  name: z.string().min(1).max(255),
});

app.get("/", async (c) => {
  const { sub: userId } = c.var.jwtPayload;

  const keys = await db.query.apiKeyTable.findMany({
    where: { userId },
    columns: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  return c.json(keys);
});

app.post("/", sValidator("json", createKeySchema), async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const { name } = await c.req.valid("json");

  const { raw, hash, prefix } = generateApiKey();
  const [apiKey] = await db
    .insert(apiKeyTable)
    .values({ name, userId, keyHash: hash, keyPrefix: prefix })
    .returning({ id: apiKeyTable.id });

  return c.json({ key: raw, id: apiKey.id }, 201);
});

app.delete("/:id", async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const id = c.req.param("id");

  const [apiKey] = await db
    .delete(apiKeyTable)
    .where(and(eq(apiKeyTable.id, id), eq(apiKeyTable.userId, userId)))
    .returning({ id: apiKeyTable.id });

  if (!apiKey) {
    return c.body("API Key not found", 404);
  }

  return c.body(null, 204);
});

export default app;
