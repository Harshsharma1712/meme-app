import {
    pgTable,
    uuid,
    varchar,
    integer,
    date,
    timestamp,
    primaryKey
} from "drizzle-orm/pg-core";

import { memes } from "./memes.js";

export const trendInsight = pgTable("trend_insights", {
    id: uuid("id").primaryKey().defaultRandom(),

    keyword: varchar("keyword", { length: 100 }),
    frequency: integer("frequency"),

    source: varchar("source", { length: 50 }),
    date: date("date"),

    createdAt: timestamp("created_at").defaultNow(),
})

