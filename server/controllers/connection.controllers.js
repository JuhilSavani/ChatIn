import { Connection } from "../models/connection.models.js";
import { User } from "../models/user.models.js";
import { Op } from "sequelize"; 

export const getConnections = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    const connections = await Connection.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { userId1: userId }, // connections that the current user has made
              { userId2: userId }, // connections that the current user has not made
            ],
          },
          {
            [Op.or]: [
              { status: { [Op.eq]: "accepted" } }, // Accepted connections
              { status: { [Op.eq]: "pending" } }, // connections that the current user has added with chat initialized by the current user
              { status: { [Op.eq]: "none" }, userId1: userId }, // connections that the current user has added without any chat initialized by the current user
            ],
          },
        ],
      },
      attributes: ["id", "status"],
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const result = connections.map((connection) => {
      // Determine the connected user
      const connectedUser =
        connection.userId1 === parseInt(userId, 10)
          ? connection.user2
          : connection.user1;

      return {
        connectionId: connection.id,
        connectedUser: {
          id: otherUser.id,
          name: connectedUser.name,
          email: connectedUser.email,
        },
      };
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "[connection.controllers.js] Error fetching connections: ",
      error.stack
    );
    return res.status(500).json({
      message: "An error occurred while fetching connections.",
      error: error.message,
    });
  }
};

export const createConnection = async (req, res) => {
  const { userId1, userId2 } = req.body;
  try {
    if (!userId1 || !userId2)
      return res.status(400).json({ message: "Both user IDs are required to establish a connection." });

    const [user1, user2] = await Promise.all([
      User.findByPk(userId1),
      User.findByPk(userId2),
    ]);

    if(!user1 || !user2)
      return res.status(404).json({ message: "One or both users not found." });

    const existingConnection = await Connection.findOne({
      where: {
        [Op.or]: [
          { userId1: userId1, userId2: userId2 },
          { userId1: userId2, userId2: userId1 },
        ],
      },
    });

    if (existingConnection){
      if(existingConnection.status == "blocked")
        return res.status(400).json({ message: "This connection is blocked." });
      else if(existingConnection.status == "pending"){
        existingConnection.status = "accepted";
        await existingConnection.save();
        return res.status(201).json(existingConnection);
      }else
        return res.status(400).json({ message: "This connection is blocked." });
    }

    const newConnection = await Connection.create({ userId1, userId2 });
    return res.status(201).json(newConnection);
  } catch (error) {
    console.error("[connection.controllers.js] Error creating connection: ", error.stack);
    return res.status(500).json({
      message: "An error occurred while creating the connection.",
      error: error.message,
    });
  }
}


export const updateConnectionStatus = async (req, res) => {
  const { connectionId } = req.params;
  const { status } = req.body;

  try {
    const connection = await Connection.findByPk(connectionId);
    if (!connection)
      return res.status(404).json({ message: "Connection not found!" });

    if (!["pending", "accepted", "blocked"].includes(status))
      return res.status(400).json({ message: "Invalid status value." });

    connection.status = status;
    await connection.save();

    return res.status(200).json({ message: "Connection status updated successfully." });

  } catch (error) {
    console.error("[connection.controllers.js] Error updating connection status: ", error.stack);
    return res.status(500).json({
      message: "An error occurred while updating the connection status.",
      error: error.message,
    });
  }
};
