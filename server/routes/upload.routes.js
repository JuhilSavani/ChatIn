import express from "express";
import { generateUploadSignature, generateMediaSignature } from "../controllers/upload.controllers.js";

const router = express.Router();

/**
 * @route   POST /api/upload/sign
 * @desc    Generate signed upload params for Cloudinary
 */
router.post("/sign", generateUploadSignature);

/**
 * @route   POST /api/upload/sign-media
 * @desc    Generate signed upload params for Chat media
 */
router.post("/sign-media", generateMediaSignature);

export default router;
