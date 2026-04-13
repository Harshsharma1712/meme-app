import "../config/env.js"

import db from "../db/index.js";
import { sql } from "drizzle-orm";
import { uploadToImagekit } from "../utils/uploadMedia.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 🔹 Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = [
    {
        name: "Drake Hotline Bling",
        tags: ["reaction", "classic"],
        file: "drake.jpg",
    },
    {
        name: "Distracted Boyfriend",
        tags: ["relationship", "classic"],
        file: "boyfriend.jpg",
    },
    {
        name: "Two Buttons",
        tags: ["decision", "funny"],
        file: "buttons.jpg",
    }
];

// 🔒 limit max 5
const limitedTemplates = templates.slice(0, 5);

const seedTemplates = async () => {
    try {
        console.log("🌱 Seeding templates...\n");

        for (const temp of limitedTemplates) {
            console.log(`➡️ Processing: ${temp.name}`);

            // 1. Read file from local assets
            const filePath = path.join(__dirname, "assets", temp.file);

            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            const fileBuffer = fs.readFileSync(filePath);

            // 2. Upload to ImageKit
            const uploadRes = await uploadToImagekit({
                fileBuffer,
                fileName: temp.file,
                folder: "/templates",
            });

            const {
                url,
                fileId,
                fileType,
                width,
                height,
                size,
            } = uploadRes;

            // 3. Insert into media
            const mediaRes = await db.execute(sql`
        INSERT INTO media (
          url,
          file_id,
          file_type,
          width,
          height,
          size_kb
        )
        VALUES (
          ${url},
          ${fileId},
          ${fileType},
          ${width},
          ${height},
          ${Math.round(size / 1024)}
        )
        RETURNING id
      `);

            const mediaId = mediaRes.rows[0].id;

            // 4. Insert into templates
            await db.execute(sql`
        INSERT INTO templates (
          name,
          media_id,
          tags
        )
        VALUES (
          ${temp.name},
          ${mediaId},
          ${sql`ARRAY[${sql.join(temp.tags.map(tag => sql`${tag}`), sql`, `)}]`}
        )
      `);

            console.log(`✅ Seeded: ${temp.name}\n`);
        }

        console.log("🎉 Done seeding templates!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedTemplates();