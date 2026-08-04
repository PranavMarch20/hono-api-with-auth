import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { authorTable } from "./authors.ts";
import { userTable } from "./users.ts";

export const bookTable = pgTable("books", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text(),
  publishDate: timestamp({ withTimezone: true }),
  pageCount: integer(),
  authorId: uuid()
    .notNull()
    .references(() => authorTable.id, { onDelete: "cascade" }),
  addedby: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
});
