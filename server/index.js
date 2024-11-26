import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { connectPostgres } from "./config/sequelize.config.js"
import { configPassport } from "./config/passport.config.js";

configDotenv();

const PORT = process.env.PORT || 4000;
const app = express();

// Connect the database
connectPostgres();

// Configure passport 
configPassport();

// Middlewares
app.use(cors({ 
  origin: process.env.NODE_ENV === "production" ?  process.env.ALLOWED_ORIGIN : "http://locahost:3000",
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // Initialize passport 

// Running the server
app.listen(PORT, () => process.stdout.write(`[SERVER] http://localhost:${PORT}\n`));