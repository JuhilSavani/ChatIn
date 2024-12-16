import { Router } from "express";
import { createConnection, getConnections } from "../controllers/connection.controllers.js";
import { authenticateJWT } from "../config/passport.config.js";

const router = Router();

router.get(`/:userId`, authenticateJWT, getConnections);
router.post(`/create`, authenticateJWT, createConnection);

export default router;