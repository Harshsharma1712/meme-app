import {
    pgTable,
    uuid,
    timestamp,
    primaryKey,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { memes } from "./memes.js";

export const likes = pgTable(
    "likes",
    {
        userId: uuid("user_id").references(() => users.id, {
            onDelete: "cascade",
        }),

        memeId: uuid("meme_id").references(() => memes.id, {
            onDelete: "cascade",
        }),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.memeId] }),
        memeIdx: index("idx_likes_meme_id").on(table.memeId),
    })
);