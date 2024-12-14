import React, { useEffect, useContext } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "./apis/axios";
import Loading from "../components/Loading";
import AuthContext from "./contexts/AuthContext";

const ProtectedRoute = () => {
  const {isAuthenticated, setIsAuthenticated} = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await axios.get("/authorize/check");

        if (response.status >= 200 && response.status < 300) {
          setIsAuthenticated(true); // User is authenticated
        } else {
          setIsAuthenticated(false); // User is not authenticated
          navigate("/sign-in", {replace: true}); // Redirect to login page
        }
      } catch (error) {
        console.error("Error checking authentication:", error.stack);
        setIsAuthenticated(false);
        navigate("/sign-in", {replace: true});
      }
    };

    checkAuthentication();
  }, [navigate]);

  if (isAuthenticated === null) return <Loading />;
  return <Outlet />; // If authenticated, render the children components
};

export default ProtectedRoute;

