import { pgTable, uuid, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { memes } from "./memes.js";

export const memeAiMetadata = pgTable("meme_ai_metadata", {
    id: uuid("id").primaryKey().defaultRandom(),

    memeId: uuid("meme_id").references(() => memes.id, {
        onDelete: "cascade",
    }),

    prompt: text("prompt"),
    modelUsed: varchar("model_used", { length: 50 }),
    tokensUsed: integer("tokens_used"),

    createdAt: timestamp("created_at").defaultNow(),
});