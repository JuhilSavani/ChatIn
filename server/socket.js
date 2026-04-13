import express from "express";
import { Server } from "socket.io";
import http from "http";
import { getRedis } from "./config/redis.config.js";

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

// ─── Presence helpers ────────────────────────────────────────────────────────

const socketKey = (userId) => `user:${userId}`;

/** Add a socketId to a user's socket set. Returns new set size. */
const addSocket = async (userId, socketId) => {
  const redis = getRedis();
  await redis.sadd(socketKey(userId), socketId);
  await redis.expire(socketKey(userId), 86400); // 24-hour TTL, refreshed each connect
  return redis.scard(socketKey(userId));
};

/** Remove a socketId from a user's socket set. Returns remaining set size. */
const removeSocket = async (userId, socketId) => {
  const redis = getRedis();
  await redis.srem(socketKey(userId), socketId);
  return redis.scard(socketKey(userId));
};

/** Returns all currently online userIds (keys matching user:*). */
const getOnlineUserIds = async () => {
  const redis = getRedis();
  const keys = await redis.keys("user:*");
  return keys.map((k) => k.replace("user:", ""));
};

// ─── Socket handlers ─────────────────────────────────────────────────────────

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    const count = await addSocket(userId, socket.id);
    if (count === 1) {
      // First connection for this user — they just came online
      io.emit("userOnline", userId);
    }
  }

  // Send the full online list to the newly connected socket only
  const onlineUsers = await getOnlineUserIds();
  socket.emit("onlineUsers", onlineUsers);

  socket.on("disconnect", async () => {
    if (userId) {
      const remaining = await removeSocket(userId, socket.id);
      if (remaining === 0) {
        // No sockets left — user is fully offline
        io.emit("userOffline", userId);
      }
    }
  });
});

// ─── Public API (unchanged contract, now async) ─────────────────────────────

/**
 * Returns array of all active socket IDs for a user (supports multiple tabs).
 * Callers: message.controllers.js, connection.controllers.js
 */
const getSocketIds = async (userId) => {
  const redis = getRedis();
  return redis.smembers(socketKey(userId)); // returns [] if key missing
};

export { app, server, io, getSocketIds };
