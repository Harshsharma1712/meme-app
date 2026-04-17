import express from "express";
import cors from "cors";
import morgan from "morgan";

import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://meme-app-eight-eta.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Logger
app.use(morgan("dev"));

// Health route
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running 🚀" });
});

import userRoutes from "./routes/user.routes.js";
import memeRoutes from "./routes/meme.routes.js";
import likeRoutes from "./routes/like.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/memes", memeRoutes);
app.use("/api/likes", likeRoutes);

// Error handler (ALWAYS LAST)
app.use(errorHandler);

export default app;