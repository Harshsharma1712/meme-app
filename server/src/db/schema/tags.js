import {
    pgTable,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 50 }).unique(),
});