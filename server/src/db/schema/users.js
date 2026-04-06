import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { media } from "./media.js";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),

    username: varchar("username", { length: 50 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),

    passwordHash: text("password_hash"),
    // below is not needed if we use media table
    avatarUrl: text("avatar_url"),

    // avatar_url using media table 
    avatarMediaId: uuid("avatar_media_id").references(() => media.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at"),
});