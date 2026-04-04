import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controllers.js";

const router = Router();

router.get(`/:connectionId`, getMessages);
router.post(`/send`, sendMessage);

export default router;