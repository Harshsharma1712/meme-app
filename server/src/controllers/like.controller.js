import { successResponse, errorResponse } from "../utils/response.js";
import {likeMemeService, unLikeMemeService, getLikeCountService} from "../services/like.service.js";
import { validationResult } from "express-validator";

export const likeMemeController = async (req, res) => {
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const userId = req.user.id;
        const { memeId } = req.params;

        const data = await likeMemeService(userId, memeId);

        return successResponse(res, "Meme Liked Successfully", data, 200);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}

export const unLikeMemeController = async (req, res) => {
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const userId = req.user.id;
        const { memeId } = req.params;

        const data = await unLikeMemeService(userId, memeId);

        return successResponse(res, "Meme unlike successfully", data, 200)

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}

export const getLikeCountController = async (req, res) => {
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const { memeId } = req.params;

        const count = await getLikeCountService(memeId);

        return successResponse(res, "Count get fetch successfully", count, 200);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}