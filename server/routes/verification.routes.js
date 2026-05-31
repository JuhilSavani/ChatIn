import { Router } from "express";
import { User } from "../models/user.models.js";
import { sendOTP, confirmOTP } from "../utils/otp.utils.js";

const router = Router();

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    await sendOTP(email);
    return res.status(200).json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("[SERVER - verifyEmail] Error:", err);
    return res
      .status(500)
      .json({ message: "An error occurred while sending mail to verify your account." });
  }
});

router.post("/confirm", async (req, res) => {
  const { email, code } = req.body;
  try {
    const isValid = await confirmOTP(email, code);
    if (isValid) {
      return res.status(200).json({ message: "OTP verified successfully." });
    }
    return res.status(400).json({ message: "Invalid or expired verification code." });
  } catch (error) {
    console.error("[SERVER - verifyOTP] Error:", error.stack);
    return res.status(500).json({ message: "An error occurred during verification." });
  }
});

router.post("/account", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(200).json({ isExisting: true });
    return res.status(200).json({ isExisting: false });   
  } catch(error){
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: "An error occurred while validating your account details." });
  }
});

export default router;
