import { Router } from "express";
import { authenticateJWT } from "../config/passport.config.js";
import { updateProfileName } from "../controllers/profile.controllers.js";

const router = Router();

router.put("/name/:id", authenticateJWT, updateProfileName);

export default router;