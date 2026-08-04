import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import z from "zod";
import { db } from "../db/db.ts";
import { bookTable } from "../db/schema.ts";
import { and, eq } from "drizzle-orm";
import { apiKeyAuth, type ApiKeyEnv } from "../middlewares/auth.ts";

const app = new Hono();

const createBookSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  publishDate: z.coerce.date().optional(),
  pageCount: z.number().int().positive().optional(),
  authorId: z.uuid(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  publishDate: z.coerce.date().nullable().optional(),
  pageCount: z.number().int().positive().nullable().optional(),
  authorId: z.uuid().optional(),
});

app.get("/", async (c) => {
  const books = await db.query.bookTable.findMany({ with: { author: true } });
  return c.json(books);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const book = await db.query.bookTable.findFirst({
    where: { id },
    with: { author: true },
  });

  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  return c.json(book);
});

const protectedApp = new Hono<ApiKeyEnv>();
protectedApp.use(apiKeyAuth);

protectedApp.post("/", sValidator("json", createBookSchema), async (c) => {
  const { id: userId } = c.get("apiKeyUser");
  const data = c.req.valid("json");

  const author = await db.query.authorTable.findFirst({
    where: { id: data.authorId },
  });

  if (!author) {
    return c.json({ error: "Author not found" }, 400);
  }

  const [book] = await db
    .insert(bookTable)
    .values({ ...data, addedby: userId })
    .returning();

  return c.json(book, 201);
});

protectedApp.put("/:id", sValidator("json", updateBookSchema), async (c) => {
  const id = c.req.param("id");
  const { id: userId, role } = c.get("apiKeyUser");
  const data = c.req.valid("json");

  if (data.authorId != null) {
    const author = await db.query.authorTable.findFirst({
      where: { id: data.authorId },
    });

    if (!author) {
      return c.json({ error: "Author not found" }, 400);
    }
  }

  const whereClause =
    role === "admin"
      ? eq(bookTable.id, id)
      : and(eq(bookTable.id, id), eq(bookTable.addedby, userId));

  const [book] = await db
    .update(bookTable)
    .set(data)
    .where(whereClause)
    .returning();

  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  return c.json(book);
});

protectedApp.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const { id: userId, role } = c.get("apiKeyUser");

  const whereClause =
    role === "admin"
      ? eq(bookTable.id, id)
      : and(eq(bookTable.id, id), eq(bookTable.addedby, userId));

  await db.delete(bookTable).where(whereClause);

  return c.body(null, 204);
});

app.route("/", protectedApp);

export default app;
