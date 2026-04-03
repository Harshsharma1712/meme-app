import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),

    username: varchar("username", { length: 50 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),

    passwordHash: text("password_hash"),
    avatarUrl: text("avatar_url"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at"),
});