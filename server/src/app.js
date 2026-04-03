import express from "express";
import cors from "cors";
import morgan from "morgan";

import errorHandler from "./middlewares/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan("dev"));

// Health route
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running 🚀" });
});

// Error handler (ALWAYS LAST)
app.use(errorHandler);

export default app;