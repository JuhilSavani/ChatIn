import { Router } from "express";
import { authenticateJWT } from "../middlewares.js";
import { updateProfile } from "../controllers/profile.controllers.js";

const router = Router();

router.put("/:id", authenticateJWT, updateProfile);

export default router;