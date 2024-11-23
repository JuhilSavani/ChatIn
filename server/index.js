import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectPostgres } from "./config/sequelize.config.js"

configDotenv();

const PORT = process.env.PORT || 4000;
const app = express();

connectPostgres();

// Middlewares
app.use(cors({ 
  origin: process.env.NODE_ENV === "production" ?  process.env.ALLOWED_ORIGIN : "http://locahost:3000",
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Running the server
app.listen(PORT, () => process.stdout.write(`[SERVER] http://localhost:${PORT}\n`));