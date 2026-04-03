import {
    pgTable,
    uuid,
    text,
    varchar,
    integer,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

export const trends = pgTable(
    "trends",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        title: text("title"),
        subreddit: varchar("subreddit", { length: 100 }),

        upvotes: integer("upvotes"),
        url: text("url"),

        tags: text("tags").array(),

        scrapedAt: timestamp("scraped_at").defaultNow(),
    },
    (table) => ({
        scrapedIdx: index("idx_trends_scraped_at").on(table.scrapedAt),
    })
);