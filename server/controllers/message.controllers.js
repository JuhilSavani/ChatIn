import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { Connection } from "../models/connection.models.js";
import { Op } from "sequelize"; 

export const getMessages = async (req, res) => {
  const { connectionId } = req.params;

  try {
    const connection = await Connection.findByPk(connectionId, {
      where: { status: { [Op.ne]: "blocked" } }
    });
    if (!connection) return res.status(404).json({ message: "Connection not found!" });

    const messages = await Message.findAll({
      where: { connectionId },
      attributes: ["id", "content", "timestamp"], 
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["name", "email"], 
        },
      ],
      order: [["timestamp", "ASC"]], 
    });

    return res.status(200).json(messages);

  } catch (error) {
    console.error("[message.controllers.js] Error fetching messages: ", error.stack);
    return res.status(500).json({
      message: "An error occurred while fetching messages.",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  const { connectionId, senderId, content } = req.body;

  try {
    if (!connectionId || !senderId || !content) 
      return res.status(400).json({ 
        message: "connectionId, senderId, and content are required.",
      });

    const connection = await Connection.findByPk(connectionId, {
      where: { status: { [Op.ne]: "blocked" } }
    });
    if (!connection) return res.status(404).json({ message: "Connection not found!" });

    if(connection.status != "accepted"){
      switch(connection.status){
        case "none":
          connection.status = "pending";
          break;
        case "pending":
          if(connection.userId2 == senderId) connection.status = "accepted";
          break;
      }
      await connection.save();
    }

    const newMessage = await Message.create(
      { connectionId, senderId, content },
      { attributes: ["id", "content", "timestamp"], raw: true }
    );

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("[message.controllers.js] Error sending message: ", error.stack);
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
    if (!message) return res.status(404).json({ message: "Message not found." });

    await message.destroy();

    return res.status(200).json({ message: "Message deleted successfully." });

  } catch (error) {
    console.error("[message.controllers.js] Error deleting message: ", error.stack);
    return res.status(500).json({
      message: "An error occurred while deleting the message.",
      error: error.message,
    });
  }
};