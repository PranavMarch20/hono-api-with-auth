import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  apiKeyTable: {
    user: r.one.userTable({
      from: r.apiKeyTable.userId,
      to: r.userTable.id,
    }),
  },
  userTable: {
    apiKeys: r.many.apiKeyTable(),
    booksAdded: r.many.bookTable(),
  },
  authorTable: {
    books: r.many.bookTable(),
  },
  bookTable: {
    author: r.one.authorTable({
      from: r.bookTable.authorId,
      to: r.authorTable.id,
    }),
    addedByUser: r.one.userTable({
      from: r.bookTable.addedby,
      to: r.userTable.id,
    }),
  },
}));
