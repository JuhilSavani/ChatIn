# BACKEND GUIDELINES

> AI Coding Agent Guidelines for ChatIn - Backend (Express / Sequelize / Socket.io)

---

## Express Route Pattern

From `server/routes/message.routes.js`:

```javascript
import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controllers.js";

const router = Router();

router.get(`/:connectionId`, getMessages);
router.post(`/send`, sendMessage);

export default router;
```

## Express Controller Pattern

From `server/controllers/message.controllers.js`:

```javascript
import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { getSocketIds, io } from "../socket.js";

export const sendMessage = async (req, res) => {
  const { connectionId, senderId, recieverId, content, attachments } = req.body;

  try {
    // 1. Input validation
    if (!connectionId || !senderId || !recieverId || (!content && !attachments?.length))
      return res.status(400).json({
        message: "connectionId, senderId, recieverId, and either content or attachments are required.",
      });

    // 2. Database operations
    const message = await Message.create({ 
      connectionId, 
      senderId, 
      content: content || null,
      attachments: attachments?.length ? attachments : null,
    });

    // 3. Real-time notification
    const socketIds = await getSocketIds(recieverId);
    socketIds.forEach((sid) => io.to(sid).emit("newMessage", newMessage));

    // 4. Success response
    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("[message.controllers.js] Error sending message: ", error.stack);
    return res.status(500).json({
      message: "An error occurred while sending the message.",
      error: error.message,
    });
  }
};
```

## Error Response Conventions

**Server-side** (`server/controllers/message.controllers.js`):

```javascript
try {
  // Business logic
  return res.status(200).json(data);
} catch (error) {
  console.error("[file.controllers.js] Error description: ", error.stack);
  return res.status(500).json({
    message: "User-friendly error message.",
    error: error.message,
  });
}
```

## Sequelize Model Pattern

From `server/models/message.models.js`:

```javascript
import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.config.js";
import { Connection } from "./connection.models.js";
import { User } from "./user.models.js";

export const Message = sequelize.define(
  "Message",
  {
    connectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Connection, key: "id" },
      onDelete: "CASCADE",
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
      // Shape: [{ publicId, secureUrl, resourceType, name }]
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: false,
  }
);

// Associations
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Message.belongsTo(Connection, { foreignKey: "connectionId", as: "connection" });
```

## Socket.io Server Setup

From `server/socket.js`:

```javascript
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { getRedis } from "./config/redis.config.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.APP_ORIGIN
      : "http://localhost:3000",
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

const socketKey = (userId) => `user:${userId}`;

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    const redis = getRedis();
    await redis.sadd(socketKey(userId), socket.id);
    await redis.expire(socketKey(userId), 86400);
  }

  socket.on("disconnect", async () => {
    if (userId) {
      const redis = getRedis();
      await redis.srem(socketKey(userId), socket.id);
    }
  });
});

const getSocketIds = async (userId) => {
  const redis = getRedis();
  return redis.smembers(socketKey(userId));
};

export { app, server, io, getSocketIds };
```

## Middleware Pattern

From `server/middlewares.js`:

```javascript
import passport from "passport";
import multer from "multer";

// JWT Authentication middleware
export const authenticateJWT = passport.authenticate('jwt', { session: false });

// File upload middleware
export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
```

## Protected Routes Setup

From `server/index.js`:

```javascript
// Public Routes
app.use("/api/authorize", authRoutes);
app.use("/api/verify", verificationRoutes);

// Protected API Routes
const protectedApi = express.Router();
protectedApi.use(authenticateJWT);
protectedApi.use("/connections", connectionRoutes);
protectedApi.use("/messages", messageRoutes);
protectedApi.use("/profile", profileRoutes);
protectedApi.use("/upload", uploadRoutes);

app.use("/api", protectedApi);
```
