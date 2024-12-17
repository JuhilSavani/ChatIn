import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.APP_ORIGIN
        : "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

const socketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) socketMap[userId] = socket.id;
  socket.on("disconnect", () => delete socketMap[userId]);
});

const getSocketId = (userId) => socketMap[userId];

export { app, server, io, getSocketId };
