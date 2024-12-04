import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GMAIL_CLIENT_ID; 
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET; 
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI; 
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN; 
const SENDER_EMAIL = process.env.SENDER_EMAIL; 

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const verifyEmail = async (req, res) => {
  const { email } = req.params;
  try {
    
    const user = await User.findOne({
      where: { email },
      attributes: ["id"],
    });

    if (user) return res.status(409).json({ message: "User already exist!" });

    const accessToken = await oAuth2Client.getAccessToken();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const transporter = nodemailer.createTransport({
      pool: true,
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL, 
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
      maxConnections: 5, // Adjust the max number of connections in the pool
      maxMessages: 10,   // Adjust the max number of messages per connection
      rateLimit: 10,     // Rate limit to control the number of messages sent per second
    });

    const mailOptions = {
      from: `ChatIn <${SENDER_EMAIL}>`,
      to: email,
      subject: "Verify Your Email Address With ChatIn",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          h1 {
            color: #333;
            font-size: 26px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
            color: #333;
          }
          .verification-code {
            font-size: 20px;
            font-weight: bold;
            padding: 0.25rem 0.5rem;
            border-radius: 2px;
            background-color: #333;
            color: #FFD369;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Verification</h1>
          <p>Your verification code is: <span class="verification-code">${verificationCode}</span></p>
          <p>Please enter this code on the verification page to complete your registration.</p>
          <p>If you did not sign up for ChatIn, please ignore this email.</p>
          <p>Thank you</p>
          <p>The ChatIn Team</p>
        </div>
      </body>
      </html>
      `,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
    return res.status(200).json({ verificationCode });
  } catch (err) {
    console.error("[SERVER - verifyEmail] Error:", err);
    return res
      .status(500)
      .json({ message: "An error occurred while sending mail to verify your account." });
  }
};

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
      const token = jwt.sign(
        { sub: user.id, name: user.name, email }, // Payload
        JWT_SECRET, 
        { expiresIn: "7d" }
      );

      res.cookie("chatinToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.sendStatus(200);
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

    const token = jwt.sign(
      { sub: newUser.id, name, email }, // Payload
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("chatinToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.sendStatus(201); // Created 
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

  return res.sendStatus(200);
};

