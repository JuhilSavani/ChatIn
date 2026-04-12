import React, { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";

const BACKEND_URL =
  import.meta.env.VITE_NODE_ENV === "development" ? "http://localhost:4000" : "/";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const queryClient = useQueryClient();
 
  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = io(BACKEND_URL, {
        withCredentials: true,
        query: { userId: user.id },
      });
      
      // socketInstance.on("connect", () => console.log("Socket connected"));
      // socketInstance.on("disconnect", () => console.log("Socket disconnected"));
      socketInstance.on("newConnection", () => {
        queryClient.invalidateQueries(["connections"]);
      });
      
      socketInstance.on("newMessage", (newMessage) => {
        queryClient.invalidateQueries(["messages", newMessage.connectionId]);
        toast.success(
          <div className="min-w-0 max-w-full overflow-hidden pr-3">
            <span className="mb-1 block truncate border-b border-current pb-1 font-bold">
              {newMessage.sender.email}
            </span>
            <span className="block truncate text-[0.9rem]">
              {newMessage.content || `📎 ${newMessage.attachments?.length || 0} attachment(s)`}
            </span>
          </div>
        );
      });

      socketInstance.on("messageReactionUpdate", ({ messageId, connectionId, reactions, action, reactorName, emoji }) => {
        queryClient.setQueryData(["messages", connectionId], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((msg) =>
            msg.id === messageId ? { ...msg, reactions } : msg
          );
        });

        if (action === "added" && reactorName && emoji) {
          toast.success(`${reactorName} reacted with ${emoji}`);
        }
      });

      socketInstance.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socketInstance.on("userOnline", (userId) => {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      });

      socketInstance.on("userOffline", (userId) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });

      setSocket(socketInstance);

      return () => { // Disconnects on exiting the web app
        socketInstance.disconnect();
        setSocket(null);
      };
    } else {
      // Disconnect socket if user is not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  const connectSocket = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const disconnectSocket = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
