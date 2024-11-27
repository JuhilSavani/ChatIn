import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.config.js";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);
