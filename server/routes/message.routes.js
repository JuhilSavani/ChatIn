import { Router } from "express";
import { getMessages, sendMessage, reactToMessage } from "../controllers/message.controllers.js";

const router = Router();

router.get(`/:connectionId`, getMessages);
router.post(`/send`, sendMessage);
router.put(`/:messageId/reaction`, reactToMessage);

export default router;