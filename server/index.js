import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { connectPostgres } from "./config/sequelize.config.js"
import { configPassport } from "./config/passport.config.js";
import authRoutes from "./routes/authorize.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import messageRoutes from "./routes/message.routes.js";
import verificationRoutes from "./routes/verification.routes.js"
import { app, server } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

// Connect the database
connectPostgres();

// Configure passport 
configPassport();

// Middlewares
app.use(cors({ 
  origin: process.env.NODE_ENV === "production" ?  process.env.ALLOWED_ORIGIN : "http://localhost:3000",
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Initialize passport 

// Testing Routes
app.get('/', (req, res) => {
  return res.status(200).send('<h1> [GET] 200: OK </h1>');
});

app.post('/', (req, res) => {
  return res.status(200).json({ message:'[POST] 200: OK', received: req.body });
});

// Actual Routes
app.use("/api/authorize", authRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/verify", verificationRoutes);

// Running the server
server.listen(PORT, () => process.stdout.write(`[SERVER] http://localhost:${PORT}\n`));