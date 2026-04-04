import { Router } from "express";
import { updateProfile } from "../controllers/profile.controllers.js";

const router = Router();

router.put("/:id", updateProfile);

export default router;