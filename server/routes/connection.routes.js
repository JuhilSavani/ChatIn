import { Router } from "express";
import { authenticateJWT } from "../middlewares.js";
import { createConnection, getConnections } from "../controllers/connection.controllers.js";

const router = Router();

router.get(`/:userId`, authenticateJWT, getConnections);
router.post(`/create`, authenticateJWT, createConnection);

export default router;