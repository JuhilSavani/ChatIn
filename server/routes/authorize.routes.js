import express from "express";
import {
  login,
  register,
  logout,
  verifyEmail,
} from "../controllers/authorize.controllers.js";
import { authenticateJWT } from "../config/passport.config.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/check", authenticateJWT, (req, res) => {
  res.status(200).json({ message: "Authenticated", user: req.user });
});
router.get("/:email", verifyEmail);


export default router;
