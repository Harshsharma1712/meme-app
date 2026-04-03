import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { memes } from "./memes.js";

export const comments = pgTable(
    "comments",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id").references(() => users.id),
        memeId: uuid("meme_id").references(() => memes.id),

        content: text("content").notNull(),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        memeIdx: index("idx_comments_meme_id").on(table.memeId),
    })
);