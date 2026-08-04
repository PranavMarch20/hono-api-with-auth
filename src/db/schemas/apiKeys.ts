import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./user.ts";
import { varchar } from "drizzle-orm/cockroach-core";

export const apiKeyTable = pgTable("api_keys", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  keyHash: text().notNull(),
  keyPreefix: varchar({ length: 8 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
