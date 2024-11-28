import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { connectPostgres } from "./config/sequelize.config.js"
import { configPassport } from "./config/passport.config.js";
import authRoutes from "./routes/authorize.routes.js";

dotenv.config();

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

// Testing Routes
app.get('/', (req, res) => {
  return res.status(200).send('<h1> [GET] 200: OK </h1>');
});

app.post('/', (req, res) => {
  return res.status(200).json({ message:'[POST] 200: OK', received: req.body });
});

// Actual Routes
app.use("/api/authorize", authRoutes);


// Running the server
app.listen(PORT, () => process.stdout.write(`[SERVER] http://localhost:${PORT}\n`));