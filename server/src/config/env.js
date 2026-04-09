import dotenv from "dotenv";

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.local";

dotenv.config({ path: envFile });

console.log(`Loaded environment from ${envFile}`);