import { Router } from "express";
import { authenticateJWT } from "../middlewares.js";
import { login, register, logout, passwordlessLogin } from "../controllers/authorize.controllers.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/passwordlessLogin", passwordlessLogin);
router.post("/logout", logout);
router.get("/status", authenticateJWT, (req, res) => {
  res.status(200).json({ message: "Authenticated", user: req.user });
});

export default router;
