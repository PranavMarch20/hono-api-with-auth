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
  },
}));
