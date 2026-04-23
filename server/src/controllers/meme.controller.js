import { successResponse, errorResponse } from "../utils/response.js";
import { 
    getTemplatesService,
    getMemeService, 
    createMemeService,
    uploadMemeService 
} from "../services/meme.service.js";
import { validationResult } from "express-validator";

// GET /templates
export const getTemplatesController = async (req, res) => {
    try {

        const templates = await getTemplatesService();

        return successResponse(res, "Templates fetched successfully", templates, 200);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}

// POST /memes
export const createMemeController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const userId = req.user.id;
        const { template_id, caption, topic, style } = req.body;

        const meme = await createMemeService({
            userId,
            template_id,
            caption,
            topic,
            style,
        });

        return successResponse(res, "Meme Posted Successfully", meme, 201)

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}

// POST meme by user from system 
export const uploadMemeController = async (req, res) => {
    try {
        
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array()[0].msg, 400);
        }

        const userId = req.user.id;
        const file = req.file
        const { caption, topic, style } = req.body;

        const meme = await uploadMemeService({
            file: file,
            userId: userId,
            caption,
            topic,
            style
        });

        return successResponse(res, "Meme Post successfully", meme, 201);

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}


// get memes
export const getMemesController = async (req, res) => {
    try {
        const memes = await getMemeService();

        return successResponse(res, "Fetch meme successfully", memes, 200)

    } catch (error) {
        console.log(error);
        return errorResponse(res, error, 400);
    }
}