import { validationResult } from "express-validator";
import { register, login } from "../services/user.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  uploadUserAvatarService,
  getUserWithAvatarService,
} from "../services/user.service.js";

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
};

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

export const uploadUserAvatarController = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await uploadUserAvatarService({ userId, file });

    return successResponse(res, "Avatar Uploded successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getUserWithAvatarController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await getUserWithAvatarService(userId);

    return successResponse(res, "Authorized user", user);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
