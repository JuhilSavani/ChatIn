import React, { useState } from "react";
import { toast } from 'react-toastify';
import { NavLink, Link, useNavigate } from "react-router-dom";
import axios from "../utils/apis/axios";
import useAuth from "../utils/hooks/useAuth";

const Navbar = () => {
  const { setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const logout = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/authorize/logout');
      setIsAuthenticated(false);
      toast.success("Logged out successfuly, 😭!");
      navigate("/sign-in", {replace: true});
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <header className="fixed top-0 left-1/2 z-10 my-2 w-[calc(100vw-1rem)] max-w-6xl -translate-x-1/2 rounded-md border-2 border-[#101010]/75 border-b-[5px] bg-primary-white px-3 sm:px-6 lg:px-10">
      <nav className="flex min-h-[60px] flex-col items-center justify-between gap-3 py-3 sm:h-[60px] sm:flex-row sm:gap-4 sm:py-0">
        <span className="text-md font-semibold text-center">
          <Link to="/" className="flex flex-col items-center leading-tight">
            <i className="bx bxs-message-alt-dots text-lg block"></i>ChatIn'
          </Link>
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 sm:px-4 lg:gap-8 lg:px-8">
          <li className="text-sm">
            <NavLink 
              to="/about"
              className="text-sm text-inherit border-none inline-flex items-center gap-2 py-2 px-3 rounded bg-secondary-black/10 transition-all duration-300 ease-in-out [&.active]:ring-2 [&.active]:ring-[#101010]/75"
            >
              <i className="bx bxs-info-square text-lg"></i>About
            </NavLink>
          </li>
          <li className="text-sm">
            <NavLink 
              to="/profile"
              className="text-sm text-inherit border-none inline-flex items-center gap-2 py-2 px-3 rounded bg-secondary-black/10 transition-all duration-300 ease-in-out [&.active]:ring-2 [&.active]:ring-[#101010]/75"
            >
              <i className="bx bxs-user-account text-lg"></i>Profile
            </NavLink>
          </li>
          <li className="text-sm">
            <button 
              onClick={logout}
              className="text-sm text-inherit inline-flex items-center gap-2 py-[0.35rem] px-[0.6rem] rounded transition-all duration-300 ease-in-out border-2 border-[#101010]/75 bg-deem-red hover:ring-2 sm:hover:ring-4 hover:ring-[#101010]/75 cursor-pointer"
            >
              <i className="bx bxs-right-arrow-square text-lg"></i>{isLoading ? "Exiting" : "Logout"}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
