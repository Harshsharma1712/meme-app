import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { memes } from "./memes";
import { tags } from "./tags";

export const memeTags = pgTable(
  "meme_tags",
  {
    memeId: uuid("meme_id").references(() => memes.id),
    tagId: uuid("tag_id").references(() => tags.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memeId, table.tagId] }),
  }),
);
