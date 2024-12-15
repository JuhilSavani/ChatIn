import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

const BACKEND_URL =
  process.env.NODE_ENV == "production"
    ? process.env.BACKEND_URL
    : "http://localhost:4000";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = io(BACKEND_URL, { withCredentials: true });
      
      socketInstance.on("connect", () => console.log("Socket connected"));
      socketInstance.on("disconnect", () => console.log("Socket disconnected"));

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
