import { Router } from "express";
import { createConnection, getConnections } from "../controllers/connection.controllers.js";

const router = Router();

router.get(`/:userId`, getConnections);
router.post(`/create`, createConnection);

export default router;