import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "Please provide both email and password to login.",
    });
  try {
    const user = await User.findOne({
      where: { email },
      attributes: ["id", "name", "password"],
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const refreshToken = jwt.sign(
        { sub: user.id, name: user.name, email },
        process.env.REFRESH_TOKEN_SECRET, // Payload
        { expiresIn: "7d" }
      );

      const accessToken = jwt.sign(
        { sub: user.id, name: user.name, email },
        process.env.ACCESS_TOKEN_SECRET, // Payload
        { expiresIn: "15m" }
      );

      res.cookie("chatinToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({ name: user.name, email, accessToken });
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

    const refreshToken = jwt.sign(
      { sub: newUser.id, name, email }, // Payload
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { sub: newUser.id, name, email }, // Payload
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("chatinToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(201).json({ name, email, accessToken }); // Created 
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res.status(200).json({ message: "Logged out successfully." });
};

export const refresh = (req, res) => {
  if (!req.cookies?.chatinToken) return res.sendStatus(401); // Unauthorized due to missing refresh token
  try {
    const refreshToken = req.cookies.chatinToken;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // Throws error for invalid refresh token
    const accessToken = jwt.sign(
      { sub: decoded.sub, name: decoded.name, email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    return res.status(200).json({ name: decoded.name, email: decoded.email, accessToken });
  } catch(error) {
    return res.sendStatus(403); // Forbidden due to invalid refresh token
  }
}
