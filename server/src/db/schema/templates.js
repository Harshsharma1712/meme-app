import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { media } from "./media.js";

export const templates = pgTable("templates", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }),

    mediaId: uuid("media_id").references(() => media.id),

    tags: text("tags").array(),

    createdAt: timestamp("created_at").defaultNow(),
});