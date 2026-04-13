import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import {
    getTemplatesController,
    createMemeController,
    getMemesController,
} from "../controllers/meme.controller.js";

const router = express.Router();

// get templates
router.get("/templates", getTemplatesController);


// post memes
router.post("/post",
    [
        body("template_id")
            .notEmpty().withMessage("Template ID is required")
            .isUUID().withMessage("Template ID must be a valid UUID"),

        body("caption")
            .notEmpty().withMessage("Caption is required")
            .isString().withMessage("Caption must be a string")
            .isLength({ max: 500 }).withMessage("Caption must be under 500 characters"),

        body("topic")
            .optional()
            .isString().withMessage("Topic must be a string")
            .isLength({ max: 100 }).withMessage("Topic too long"),

        body("style")
            .optional()
            .isString().withMessage("Style must be a string")
            .isLength({ max: 50 }).withMessage("Style too long"),
    ]
    , authMiddleware,
    createMemeController);

// get memes
router.get("/get", getMemesController);

export default router;
