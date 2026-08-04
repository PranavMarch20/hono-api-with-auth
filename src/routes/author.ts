import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { authorTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { apiKeyAuth, type ApiKeyEnv } from "../middlewares/auth.ts";

const app = new Hono();

const createAuthorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z.coerce.date().optional(),
});

const updateAuthorSchema = z.object({
  name: z.string().min(1).optional(),
  birthday: z.coerce.date().nullable().optional(),
});

app.get("/", async (c) => {
  const authors = await db.query.authorTable.findMany();
  return c.json(authors);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const author = await db.query.authorTable.findFirst({ where: { id } });

  if (!author) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(author);
});

const protectedApp = new Hono<ApiKeyEnv>()
protectedApp.use(apiKeyAuth);

protectedApp.post("/", sValidator("json", createAuthorSchema), async (c) => {
  const data = c.req.valid("json");

  const [author] = await db.insert(authorTable).values(data).returning();
  
  return c.json(author, 201);
});

protectedApp.put("/:id", sValidator("json", updateAuthorSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const [author] = await db
    .update(authorTable)
    .set(data)
    .where(eq(authorTable.id, id))
    .returning();

  if (!author) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(author, 201);
});

protectedApp.delete("/:id", async (c) => {
  const id = c.req.param("id");

  await db.delete(authorTable).where(eq(authorTable.id, id))

  return c.body(null, 204);
});

app.route("/", protectedApp);

export default app;
