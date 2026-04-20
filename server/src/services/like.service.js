import { sql } from "drizzle-orm"
import db from "../db/index.js";

export const likeMemeService = async (userId, memeId) => {
    
  const likeMemeQuery = sql`
    INSERT INTO likes (user_id, meme_id)
    VALUES (${userId}, ${memeId})
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;

  const likeMemeQueryResult = await db.execute(likeMemeQuery);
  
  const likesResult = likeMemeQueryResult.rows[0];

  if (!likesResult) {
    console.log({ message: "Already liked" });
  }

  console.log(likesResult);

  return likesResult;

}

export const unLikeMemeService = async (userId, memeId) => {
    
    const unLikeMemeQuery = sql`
    DELETE FROM likes
    WHERE user_id = ${userId} AND meme_id = ${memeId}
    RETURNING *
    `;

    const unLikeMemeQueryResult = await db.execute(unLikeMemeQuery);

    const unlikeResult = unLikeMemeQueryResult.rows[0] || null;
    console.log(unlikeResult);
    
    return unlikeResult;

}

export const getLikeCountService = async (memeId, userId) => {
    
    const getLikeCountQuery = sql`
    SELECT 
      COUNT(*)::int AS count,
      EXISTS (
        SELECT 1 
        FROM likes 
        WHERE meme_id = ${memeId}
        AND user_id = ${userId}
      ) AS is_liked
    FROM likes
    WHERE meme_id = ${memeId}
    `;

    const getLikeCountQueryResult = await db.execute(getLikeCountQuery);

    const likeCount = getLikeCountQueryResult.rows[0];
    console.log(likeCount);

    return likeCount;

}
