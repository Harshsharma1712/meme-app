import bcrypt from "bcryptjs";
import db from "../db/index.js";
import { users } from "../db/schema/index.js";
import { generateToken } from "../utils/jwt.js";
import { eq, sql } from "drizzle-orm";
import { uploadToImagekit } from "../utils/uploadMedia.js";
import { media } from "../db/schema/index.js";

// Register user
export const register = async ({ username, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  const query = sql`
    SELECT * FROM users
    WHERE email = ${normalizedEmail}
    OR username = ${normalizedUsername}
    LIMIT 1
    `;

  const result = await db.execute(query);
  // console.log(result);
  // console.log(result.rows);

  const existingUser = result.rows?.[0] || null;

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // insert user
  const [newUser] = await db
    .insert(users)
    .values({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  });

  return {
    user: newUser,
    token,
  };
};

// login user
export const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // const user = await db.query.users.findFirst({
  //     where: eq(users.email, normalizedEmail),
  // });

  const query = sql`
    SELECT * FROM users
    WHERE email = ${normalizedEmail}
    LIMIT 1
    `;

  const result = await db.execute(query);
  // console.log(result.rows);

  const user = result.rows?.[0] || null;
  console.log(user);
  console.log(typeof user);

  if (!user) {
    throw new Error("No user found");
  }

  // if (!user || !user.passwordHash) {
  //     throw new Error("No email email or password");
  // }

  if (!user.password_hash) {
    throw new Error("No password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  };
};

// upload user avatar
export const uploadUserAvatarService = async ({ userId, file }) => {
  try {
    if (!file) {
      throw new Error("Avatar File is required");
    }

    // 1) Find current avatar if exists
    const query = sql`
        SELECT * FROM users
        WHERE id = ${userId}
        LIMIT 1
        `;

    const result = await db.execute(query);

    const existingUser = result.rows?.[0] || null;
    console.log(existingUser);

    if (!existingUser) {
      throw new Error("User not found");
    }

    // 2) Upload new avatar to ImageKit
    const uploaded = await uploadToImagekit({
      fileBuffer: file.buffer,
      fileName: `${userId}-${Date.now()}-${file.originalname}`,
      folder: "/media",
    });

    console.log(uploaded);

    // 3) Save media record
    const [newMedia] = await db
      .insert(media)
      .values({
        url: uploaded.url,
        fileId: uploaded.fileId,
        fileType: uploaded.fileType || file.mimetype,
        format: uploaded.name?.split(".").pop() || null,
        width: uploaded.width || null,
        height: uploaded.height || null,
        sizeKb: uploaded.size ? Math.round(uploaded.size / 1024) : null,
        uploadedBy: userId,
      })
      .returning();

    // 4) Update user's avatarMediaId
    await db
      .update(users)
      .set({
        avatarMediaId: newMedia.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // 5) OPTIONAL: delete previous image from ImageKit later if you want cleanup

    return {
      mediaId: newMedia.id,
      avatarUrl: newMedia.url,
    };
  } catch (error) {
    throw new Error("Error in uploadUserAvatarService");
  }
};

export const getUserWithAvatarService = async (userId) => {
  console.log(userId);
  const query = sql`
    SELECT 
    ${users.id} AS id, 
    ${users.email} AS email, 
    ${users.username} AS username, 
    ${media.url} AS "avatarUrl"
    FROM ${users}
    LEFT JOIN ${media} ON ${users.avatarMediaId} = ${media.id}
    WHERE ${users.id} = ${userId}
    LIMIT 1
    `;

  const result = await db.execute(query);

  const user = result.rows?.[0] || null;
  console.log(user);

  return user;
};
