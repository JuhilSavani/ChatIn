import express from "express";
import { authenticateJWT } from "../middlewares.js";
import { generateUploadSignature } from "../controllers/upload.controllers.js";

const router = express.Router();

/**
 * @route   POST /api/upload/sign
 * @desc    Generate signed upload params for Cloudinary
 */
router.post("/sign", authenticateJWT, generateUploadSignature);

export default router;
