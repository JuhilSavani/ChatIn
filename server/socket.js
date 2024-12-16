import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGIN
        : "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

const socketMap = {};

io.on("connection", (socket) => {
  console.log("User has been connected: ", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) socketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log("User has been disconnected: ", socket.id);
    delete socketMap[userId];
  });
});

const getSocketId = (userId) => socketMap[userId];

export { app, server, io, getSocketId };
