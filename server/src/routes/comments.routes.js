import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    addCommentController,
    deleteCommentController,
    getCommentByMemeController
} from "../controllers/comments.controller.js";
import { body } from "express-validator";

const router = express.Router();

// post comment
router.post("/:memeId",
    [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Content is required")
    //   .isLength({ min: 3, max: 50 })
    ],
    authMiddleware, addCommentController);

// get comment for meme
router.get("/:memeId", authMiddleware, getCommentByMemeController);

// delete comments
router.delete("/:commentId", authMiddleware, deleteCommentController);

export default router;