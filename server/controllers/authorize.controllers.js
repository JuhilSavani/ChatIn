import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { confirmOTP } from "../utils/otp.utils.js";

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV_SECURE = process.env.NODE_ENV === "production";
const IS_DEV = process.env.NODE_ENV === "development";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "Please provide both email and password to login.",
    });
  try {
    const user = await User.findOne({ where: { email } });

    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        profilePicUrl: user.profilePicUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      const token = jwt.sign(
        payload, 
        JWT_SECRET, 
        { expiresIn: "7d" }
      );

      res.cookie("chatinToken", token, {
        httpOnly: true,
        secure: NODE_ENV_SECURE,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ user: payload });
    } else {
      if (!user) return res.status(404).json({ message: "User not found!" });
      return res.status(401).json({ message: "Invalid password!" });
    }
  } catch (error) {
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const register = async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({
      message:
        "Please provide all details to create a new account.",
    });

  try {    
    if (!IS_DEV) {
      if (!otp) return res.status(400).json({ message: "Verification code is required." });
      const isValid = await confirmOTP(email, otp);
      if (!isValid) return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const payload = { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email, 
      profilePicUrl: newUser.profilePicUrl,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    }

    const token = jwt.sign(
      payload, 
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("chatinToken", token, {
      httpOnly: true,
      secure: NODE_ENV_SECURE,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(201).json({ user: payload }); // Created 
  } catch (error) {
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const passwordlessLogin = async (req, res) =>{
  const { email, otp } = req.body;
  if (!email)
    return res.status(400).json({
      message: "Please provide both email to signin.",
    });
  try {
    if (!IS_DEV) {
      if (!otp) return res.status(400).json({ message: "Verification code is required." });
      const isValid = await confirmOTP(email, otp);
      if (!isValid) return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found!" });
    
    const payload = { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      profilePicUrl: user.profilePicUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const token = jwt.sign(
      payload, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("chatinToken", token, {
      httpOnly: true,
      secure: NODE_ENV_SECURE,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ user: payload });
  } catch (error) {
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const logout = (req, res) => {
  if (!req.cookies?.chatinToken) return res.sendStatus(204); // No Content

  res.clearCookie("chatinToken", {
    httpOnly: true,
    secure: NODE_ENV_SECURE,
    sameSite: "Strict",
  });

  return res.sendStatus(200);
};
