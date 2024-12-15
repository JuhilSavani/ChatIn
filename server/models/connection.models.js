import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.config.js";
import { User } from "./user.models.js"

export const Connection = sequelize.define(
  "Connection",
  {
    id: { // connection id
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, 
        key: 'id',
      },
      onDelete: 'CASCADE', 
    },
    userId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, 
        key: 'id',
      },
      onDelete: 'CASCADE', 
    },
    status: {
      type: DataTypes.ENUM('none', 'pending', 'accepted', 'blocked'),
      defaultValue: 'none',
    },
  },
  {
    tableName: "connections",
    timestamps: true,
    defaultScope: {
      where: {
        status: { [DataTypes.Op.ne]: "blocked" }, // Exclude blocked connections by default
      },
    },
  }
);

// Set up associations
User.belongsToMany(User, {
  through: Connection,
  as: "connections",
  foreignKey: "userId1",
  otherKey: "userId2",
});

// Adding constraints
Connection.addConstraint("connections", {
  fields: ["userId1", "userId2"],
  type: "unique",
  name: "unique_connection",
});