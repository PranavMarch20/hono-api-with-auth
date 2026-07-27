import { Hono } from "hono";

const app = new Hono();

const authors = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];

app.get("/", (c) => {
  return c.json(authors);
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  const author = authors.find((a) => a.id === id);

  if (!author) {
    return c.json({error: "Author not found"}, 404);
  }

  return c.json(author);
});

export default app;
