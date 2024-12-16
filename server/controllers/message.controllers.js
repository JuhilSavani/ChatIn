import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { Connection } from "../models/connection.models.js";
import { Op } from "sequelize";
import { getSocketId, io } from "../socket.js";
import { computedConnection } from "./connection.controllers.js";

export const getMessages = async (req, res) => {
  const { connectionId } = req.params;

  try {
    const connection = await Connection.findByPk(connectionId, {
      where: { status: { [Op.ne]: "blocked" } },
    });
    if (!connection)
      return res.status(404).json({ message: "Connection not found!" });

    const messages = await Message.findAll({
      where: { connectionId },
      attributes: ["id", "content", "timestamp"],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id"],
        },
      ],
      order: [["timestamp", "ASC"]],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error(
      "[message.controllers.js] Error fetching messages: ",
      error.stack
    );
    return res.status(500).json({
      message: "An error occurred while fetching messages.",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  const { connectionId, senderId, recieverId, content } = req.body;

  try {
    if (!connectionId || !senderId || !recieverId || !content)
      return res.status(400).json({
        message: "connectionId, senderId, recieverId and content are required.",
      });

    const connection = await Connection.findByPk(connectionId, {
      where: { status: { [Op.ne]: "blocked" } },
      attributes: ["id", "status"],
      include: [
        { model: User, as: "user1", attributes: ["id", "name", "email"] },
        { model: User, as: "user2", attributes: ["id", "name", "email"] },
      ],
    });
    if (!connection)
      return res.status(404).json({ message: "Connection not found!" });

    if (connection.status != "accepted") {
      switch (connection.status) {
        case "none":
          connection.status = "pending";
          await connection.save();
          const newConnection = computedConnection(recieverId, connection);
          const socketId = getSocketId(recieverId);
          if(socketId) io.to(socketId).emit("newConnection", newConnection);
          break;
        case "pending":
          if (connection.userId2 == senderId){ 
            connection.status = "accepted";
            await connection.save();
          }
          break;
      }
    }

    const message = await Message.create({ connectionId, senderId, content });

    const newMessage = { 
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sender: { id: message.senderId }
    };

    const socketId = getSocketId(recieverId);
    if(socketId) io.to(socketId).emit("newMessage", newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(
      "[message.controllers.js] Error sending message: ",
      error.stack
    );
    return res.status(500).json({
      message: "An error occurred while sending the message.",
      error: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByPk(messageId);
    if (!message)
      return res.status(404).json({ message: "Message not found." });

    await message.destroy();

    return res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error(
      "[message.controllers.js] Error deleting message: ",
      error.stack
    );
    return res.status(500).json({
      message: "An error occurred while deleting the message.",
      error: error.message,
    });
  }
};
