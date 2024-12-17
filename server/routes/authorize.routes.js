import { Router } from "express";
import { login, register, logout } from "../controllers/authorize.controllers.js";
import { authenticateJWT } from "../config/passport.config.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/status", authenticateJWT, (req, res) => {
  res.status(200).json({ message: "Authenticated", user: req.user });
});

export default router;
