import express from "express";
import { verifyEmail, verifyAccount } from "../controllers/verification.controllers.js";

const router = express.Router();

router.get("/:email", verifyEmail);
router.post("/account", verifyAccount);

export default router;

