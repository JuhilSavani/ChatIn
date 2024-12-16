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
    indexes: [
      {
        unique: true,
        fields: ['userId1', 'userId2'],
        name: 'unique_connection',
      }
    ]
  }
);

// Associations
Connection.belongsTo(User, { as: 'user1', foreignKey: 'userId1' });
Connection.belongsTo(User, { as: 'user2', foreignKey: 'userId2' });
