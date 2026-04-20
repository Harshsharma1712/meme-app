import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import {
    likeMemeController,
    unLikeMemeController,
    getLikeCountController
} from "../controllers/like.controller.js";

const router = express.Router();

// like meme
router.post("/:memeId", authMiddleware,likeMemeController)

// unlike meme
router.delete("/:memeId", authMiddleware, unLikeMemeController);

// get like count 
router.get("/:memeId/count", authMiddleware, getLikeCountController)

export default router