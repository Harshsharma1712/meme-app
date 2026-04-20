import { successResponse, errorResponse } from "../utils/response.js";
import { addCommentService,
    getCommentByMemeService,
    deleteCommentService
} from "../services/comments.servie.js";
import { validationResult } from "express-validator";

export const addCommentController = async (req, res) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }
        
        const userId = req.user.id;
        const { memeId } = req.params;
        const { content } = req.body;

        const comment = await addCommentService(userId, memeId, content);

        return successResponse(res, "Comment post successfully", comment, 201);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}

export const getCommentByMemeController = async (req, res) => {
    
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const { memeId } = req.params;

        const comments = await getCommentByMemeService(memeId);

        return successResponse(res, "Fetch comments successfully", comments, 200);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }

}

export const deleteCommentController = async (req, res) => {
    try {
        
        const userId = req.user.id;
        const { commentId } = req.params;

        const data = await deleteCommentService(commentId, userId);

        if (data.length === 0) {
            return errorResponse(res, "Comment not found or something wrong here.")
        }

        return successResponse(res, "Comment deleted successfully", data, 200);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}
