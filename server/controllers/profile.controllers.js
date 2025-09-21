import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV_SECURE = process.env.NODE_ENV === "production";

export const updateProfileName = async (req, res) => {
  try {

    if(!req.params?.id) 
      return res.status(400).json({ message: "The request must include a valid user ID in the URL." });
    
    if(!req.body?.name) 
      return res.status(400).json({ message: "Please provide a new name in the request body." });

    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: "Profile not found" });

    user.name = req.body.name;
    await user.save();

    if (req.cookies?.chatinToken) {
      res.clearCookie("chatinToken", {
        httpOnly: true,
        secure: NODE_ENV_SECURE,
        sameSite: "Strict",
      });
    }

    const payload = {
      id: user.id, 
      name: user.name, 
      email: user.email, 
      createdAt: user.createdAt
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

    // TODO: Broadcast profile updates via sockets so online connections see updated name in real-time

    return res.status(200).json({ message: "Profile updated successfully", user: payload });
  } catch (error) {
    console.error(error.stack);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
