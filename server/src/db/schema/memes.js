import {
    pgTable,
    uuid,
    text,
    varchar,
    boolean,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { templates } from "./templates.js";
import { media } from "./media.js";

export const memes = pgTable(
    "memes",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        userId: uuid("user_id").references(() => users.id),
        templateId: uuid("template_id").references(() => templates.id),
        mediaId: uuid("media_id").references(() => media.id),

        topic: text("topic"),
        style: varchar("style", { length: 50 }),

        caption: text("caption"),
        explanation: text("explanation"),

        isAiGenerated: boolean("is_ai_generated").default(true),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        userIdx: index("idx_memes_user_id").on(table.userId),
        createdIdx: index("idx_memes_created_at").on(table.createdAt),
    })
);