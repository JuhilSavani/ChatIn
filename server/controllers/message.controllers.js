import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { Connection } from "../models/connection.models.js";
import { Op } from "sequelize";
import { getSocketId, io } from "../socket.js";
import { computedConnection } from "./connection.controllers.js";

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const MESSAGE_SEND_TEST_DELAY_MS = 3000;

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
      attributes: ["id", "content", "timestamp", "attachments", "reactions"],
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
  const { connectionId, senderId, recieverId, content, attachments } = req.body;

  try {
    if (!connectionId || !senderId || !recieverId || (!content && !attachments?.length))
      return res.status(400).json({
        message: "connectionId, senderId, recieverId, and either content or attachments are required.",
      });

    // Temporary latency to test pending message UI.
    // await sleep(MESSAGE_SEND_TEST_DELAY_MS);

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
          if (connection.user2.id == senderId){ 
            connection.status = "accepted";
            await connection.save();
          }
          break;
      }
    }

    const message = await Message.create({ 
      connectionId, 
      senderId, 
      content: content || null,
      attachments: attachments?.length ? attachments : null,
    });

    const newMessage = { 
      id: message.id,
      connectionId: message.connectionId,
      content: message.content,
      timestamp: message.timestamp,
      attachments: message.attachments,
      reactions: message.reactions || {},
      sender: { 
        id: message.senderId, 
        email: connection.user1.id === senderId 
        ? connection.user1.email : connection.user2.email 
      }
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

export const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { reaction, userId, receiverId } = req.body;

  try {
    if (!reaction || !userId || !receiverId) {
      return res.status(400).json({ message: "reaction, userId, and receiverId are required." });
    }

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Ensure reactions is an object
    let currentReactions = message.reactions || {};
    
    // Toggle logic: If user already reacted with the same string, remove it.
    let action = '';
    if (currentReactions[userId] === reaction) {
      delete currentReactions[userId];
      action = 'removed';
    } else {
      currentReactions[userId] = reaction;
      action = 'added';
    }

    // Fetch user for notification
    const reactor = await User.findByPk(userId);
    const reactorName = reactor ? reactor.name : "Someone";

    // Required since we are modifying a JSON field
    message.reactions = currentReactions;
    message.changed('reactions', true);

    await message.save();

    // Emit real-time notification to the receiver
    const socketId = getSocketId(receiverId);
    if (socketId) {
      io.to(socketId).emit("messageReactionUpdate", {
        messageId: message.id,
        connectionId: message.connectionId,
        reactions: message.reactions,
        action,
        reactorName,
        emoji: reaction
      });
    }

    return res.status(200).json({ 
      messageId: message.id,
      reactions: message.reactions 
    });

  } catch (error) {
    console.error(
      "[message.controllers.js] Error toggling reaction: ",
      error.stack
    );
    return res.status(500).json({
      message: "An error occurred while toggling the reaction.",
      error: error.message,
    });
  }
};
