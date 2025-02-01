import React, { createContext, useState, useEffect } from "react";
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
        // TODO: improve this toasting 
        toast.success(`New message from ${newMessage.sender.email}`);
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

  const connectSocket = () => {
    if (socket && !socket.connected) {
      socket.connect();
      setSocket(socket);
    }
  };

  const disconnectSocket = () => {
    if (socket && socket.connected) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
