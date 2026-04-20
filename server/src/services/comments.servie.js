import { sql } from "drizzle-orm"
import db from "../db/index.js";

export const addCommentService = async (userId, memeId, content) => {
    
    const addCommentQuery = sql`
        INSERT INTO comments (user_id, meme_id, content)
        VALUES (${userId}, ${memeId}, ${content})
        RETURNING *
    `;

    const addCommentQueryResult = await db.execute(addCommentQuery);

    const comment = addCommentQueryResult.rows[0];

    console.log(comment);
    return comment;

}

export const getCommentByMemeService = async (memeId) => {
    
    const getCommentByMemeQuery = sql`
        SELECT 
        c.id,
        c.content,
        c.created_at,
        u.username,
        m.url AS avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN media m ON u.avatar_media_id = m.id
    WHERE c.meme_id = ${memeId}
    ORDER BY c.created_at DESC
    `;

    const getCommentByMemeQueryResult = await db.execute(getCommentByMemeQuery);

    const comments = getCommentByMemeQueryResult.rows;
    console.log(comments);

    return comments;

}

export const deleteCommentService = async (commentId, userId) => {
    
    const deleteCommentQuery = sql`
        DELETE FROM comments
        WHERE id = ${commentId} AND user_id = ${userId}
        RETURNING *
    `;

    const deleteCommentQueryResult = await db.execute(deleteCommentQuery)

    return deleteCommentQueryResult.rows

}
