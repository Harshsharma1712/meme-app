import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import { registerUser, loginUser, uploadUserAvatarController } from "../controllers/user.controller.js";
import { upload } from "../utils/multer.js"

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Authorized user",
        user: req.user,
    });
});

router.post(
    "/register",
    [
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLength({ min: 3, max: 50 })
            .withMessage("Username must be between 3 and 50 characters"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    registerUser
);

router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),

        body("password")
            .notEmpty()
            .withMessage("Password is required"),
    ],
    loginUser
);

router.post(
    "/avatar",
    authMiddleware,
    upload.single("user-avatar"),
    uploadUserAvatarController
);

export default router;