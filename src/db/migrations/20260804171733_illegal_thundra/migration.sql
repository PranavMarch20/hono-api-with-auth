CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text,
	"publishDate" timestamp with time zone,
	"pageCount" integer,
	"authorId" uuid NOT NULL,
	"addedby" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_authorId_authors_id_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_addedby_users_id_fkey" FOREIGN KEY ("addedby") REFERENCES "users"("id") ON DELETE CASCADE;