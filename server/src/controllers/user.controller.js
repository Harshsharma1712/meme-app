import { validationResult } from "express-validator";
import { register, login } from "../services/user.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const { username, email, password } = req.body;

        const result = await register({ username, email, password });

        return successResponse(res, "User register successfully", result, 201);

    } catch (error) {
        return errorResponse(res, error.message || "Registration failed", 400);
    }
}

export const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const { email, password } = req.body;

        const result = await login({ email, password });

        return successResponse(res, "Login successful", result, 200);
    } catch (error) {
        return errorResponse(res, error.message || "Login failed", 400);
    }
};

