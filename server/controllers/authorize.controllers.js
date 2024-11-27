import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const login = async (req, res) => {
  return res.status(200).send("signing in...");
};

export const register = async (req, res) => {
  return res.status(200).send("signing up...");
};

export const logout = async (req, res) => {
  return res.status(200).send("logging out...");
};

