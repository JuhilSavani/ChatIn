import { Router } from "express";
import { authenticateJWT, upload } from "../middlewares.js";
import { updateProfile } from "../controllers/profile.controllers.js";

const router = Router();

router.put("/:id", authenticateJWT, upload.single("profilePic"), updateProfile);

export default router;