import { pgTable, uuid, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const media = pgTable("media", {
    id: uuid("id").primaryKey().defaultRandom(),

    url: text("url").notNull(),
    fileId: varchar("file_id", { length: 255 }),

    fileType: varchar("file_type", { length: 50 }),
    format: varchar("format", { length: 20 }),

    width: integer("width"),
    height: integer("height"),
    sizeKb: integer("size_kb"),

    uploadedBy: uuid("uploaded_by").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow(),
});