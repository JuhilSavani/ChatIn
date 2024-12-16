import { Router } from "express";
import { authenticateJWT } from "../config/passport.config.js";
import { getMessages, sendMessage } from "../controllers/message.controllers.js";

const router = Router();

router.get(`/:connectionId`, authenticateJWT, getMessages);
router.post(`/send`, authenticateJWT, sendMessage);

export default router;