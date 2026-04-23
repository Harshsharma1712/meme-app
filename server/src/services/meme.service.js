import db from "../db/index.js";
import { sql } from "drizzle-orm";
import { uploadToImagekit } from "../utils/uploadMedia.js";

// get templates
export const getTemplatesService = async () => {

    const query = sql`
    SELECT 
      t.id,
      t.name,
      t.tags,
      m.url AS media_url
    FROM templates t
    LEFT JOIN media m ON t.media_id = m.id
    ORDER BY t.created_at DESC
    `;

    const result = await db.execute(query);

    const templates = result.rows || null
    // console.log(templates)

    return templates

}

// create meme
export const createMemeService = async ({
    userId,
    template_id,
    caption,
    topic,
    style,
}) => {
    //  Get template media_id
    const templateMediaQuery = sql`
    SELECT media_id
    FROM templates
    WHERE id = ${template_id}
    LIMIT 1
    `;

    const templateMediaQueryResult = await db.execute(templateMediaQuery);

    const templateMediaId = templateMediaQueryResult.rows?.[0].media_id;
    console.log(templateMediaId)

    const createMemeQuery = sql`
        INSERT INTO memes (
        user_id,
        template_id,
        media_id,
        caption,
        topic,
        style,
        is_ai_generated
        )
        VALUES (
        ${userId},
        ${template_id},
        ${templateMediaId},
        ${caption},
        ${topic},
        ${style},
        false
        )
        RETURNING *
    `;

    const createMemeQueryResult = await db.execute(createMemeQuery);

    const createdMeme = createMemeQueryResult.rows?.[0] || null;
    // console.log(createdMeme)

    return createdMeme;
};

// service for user created meme uploding 
export const uploadMemeService = async ({
    file,
    userId,
    caption,
    topic,
    style
}) => {

    if (!file) {
        throw new Error("No file uploaded");
    }

    // Upload to ImageKit
    const uploadRes = await uploadToImagekit({
        fileBuffer: file.buffer,
        fileName: `${userId}-${Date.now()}-${file.originalname}`,
        folder: "/memes"
    })
    console.log(uploadRes);

    // insert into media
    const mediaResult = await db.execute(sql`
        INSERT INTO media (
            url,
            file_id,
            file_type,
            format,
            width,
            height,
            size_kb,
            uploaded_by
        )
        VALUES (
            ${uploadRes.url},
            ${uploadRes.fileId},
            ${file.mimetype},
            ${uploadRes.fileType},
            ${uploadRes.width},
            ${uploadRes.height},
            ${Math.round(file.size / 1024)},
            ${userId}
        )
        RETURNING *    
    `);

    const mediaId = mediaResult?.rows[0].id;

    // Insert into memes (template_id = NULL)
    const memeResult = await db.execute(sql`
        INSERT INTO memes (
            user_id,
            template_id,
            media_id,
            caption,
            topic,
            style,
            is_ai_generated
        )
        VALUES (
            ${userId},
            NULL,
            ${mediaId},
            ${caption},
            ${topic},
            ${style},
            false
        )
        RETURNING *
    `);

    return memeResult?.rows[0];

}

// get memes (feed)
export const getMemeService = async () => {
    const getMemeQuery = sql`
        SELECT 
        me.id,
        me.caption,
        me.topic,
        me.style,
        me.created_at,

        u.id AS user_id,
        u.username,

        avatar.url AS avatar_url,

        m.url AS media_url,

        COUNT(DISTINCT l.user_id) AS likes_count,
        COUNT(DISTINCT c.id) AS comments_count

        FROM memes me

        LEFT JOIN users u ON me.user_id = u.id

        LEFT JOIN media avatar ON u.avatar_media_id = avatar.id

        LEFT JOIN media m ON me.media_id = m.id
        LEFT JOIN likes l ON l.meme_id = me.id
        LEFT JOIN comments c ON c.meme_id = me.id

        GROUP BY me.id, u.id, m.url, avatar.url

        ORDER BY me.created_at DESC
    `;

    const getMemeQueryResult = await db.execute(getMemeQuery);

    const getMeme = getMemeQueryResult.rows || null
    console.log(getMeme)

    return getMeme;

}