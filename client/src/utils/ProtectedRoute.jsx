import React, { useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import axios from "./apis/axios";
import Loading from "../components/Loading";
import useAuth from "./hooks/useAuth";
import useSocket from "./hooks/useSocket";

const ProtectedRoute = () => {
  const { connectSocket } = useSocket();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const response  = await axios.get("/authorize/status");
        setIsAuthenticated(true); // User is authenticated
        setUser(response?.data?.user);
        connectSocket();
      } catch (error) {
        console.error(error?.response?.data.stack ||error.stack);
        
        const searchParams = new URLSearchParams(location.search);
        const connectEmail = searchParams.get("connect");
        if (connectEmail) {
          localStorage.setItem("pendingConnection", connectEmail);
        }

        toast.info("Please login to continue, 😙!");
        setIsAuthenticated(false); // User is not authenticated
        navigate("/sign-in", {replace: true});
      }
    })();
  }, [navigate, location.search, connectSocket, setIsAuthenticated, setUser]);

  if (isAuthenticated === null) return <Loading />;
  return <Outlet />; // If authenticated, render the children components
};

export default ProtectedRoute;

