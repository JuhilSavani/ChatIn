import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.config.js";
import { Connection } from "./connection.models.js"; // Import the connection model
import { User } from "./user.models.js"; // Import the user model

export const Message = sequelize.define(
  "Message",
  {
    connectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Connection, // Connects to the Connection model
        key: "id",
      },
      onDelete: "CASCADE", // Deletes messages if the connection is deleted
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Connects to the User model
        key: "id",
      },
      onDelete: "CASCADE", // Deletes messages if the sender is deleted
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false, // Message content can't be empty
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Automatically set the current timestamp
    },
  },
  {
    tableName: "messages",
    timestamps: false, // We manage the timestamp manually
  }
);

// Associations
Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender",
});

Message.belongsTo(Connection, {
  foreignKey: "connectionId",
  as: "connection",
});