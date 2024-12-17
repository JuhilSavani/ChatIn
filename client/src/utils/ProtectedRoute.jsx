import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "./apis/axios";
import Loading from "../components/Loading";
import useAuth from "./hooks/useAuth";
import useSocket from "./hooks/useSocket";

const ProtectedRoute = () => {
  const { connectSocket } = useSocket();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response  = await axios.get("/authorize/status");
        setIsAuthenticated(true); // User is authenticated
        setUser(response?.data?.user);
        connectSocket();
      } catch (error) {
        console.error(error?.response?.data.stack ||error.stack);
        toast.error("Please login to continue!");
        setIsAuthenticated(false); // User is not authenticated
        navigate("/sign-in", {replace: true});
      }
    };

    checkAuthentication();
  }, [navigate]);

  if (isAuthenticated === null) return <Loading />;
  return <Outlet />; // If authenticated, render the children components
};

export default ProtectedRoute;

