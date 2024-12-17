import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV_SECURE = process.env.NODE_ENV === "production";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "Please provide both email and password to login.",
    });
  try {
    const user = await User.findOne({ where: { email } });

    if (user && bcrypt.compareSync(password, user.password)) {
      const payload = { id: user.id, name: user.name, email, createdAt: user.createdAt };
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
      .json({ message: "An error occurred during signing in!" });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({
      message:
        "Please provide all details to create a new account.",
    });

  try {    
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const payload = { id: newUser.id, name, email, createdAt: newUser.createdAt }
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
      .json({ message: "An error occurred during signing up!" });
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

