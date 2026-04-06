import bcrypt from "bcryptjs";
import db from "../db/index.js";
import { users } from "../db/schema/index.js";
import { generateToken } from "../utils/jwt.js";
import { sql } from "drizzle-orm";

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
            passwordHash
        })
        .returning({
            id: users.id,
            username: users.username,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })

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
    console.log(user)
    console.log(typeof (user))

    if (!user) {
        throw new Error("No user found")
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
}
