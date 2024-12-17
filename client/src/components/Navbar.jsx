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
      toast.success("Logged out successfuly!");
      navigate("/sign-in", {replace: true});
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <header>
      <nav>
        <span>
          <Link><i className="bx bxs-message-alt-dots"></i>ChatIn'</Link>
        </span>
        <ul>
          <li>
            <NavLink to="/about"><i className='bx bxs-info-square' ></i>About</NavLink>
          </li>
          <li>
            <NavLink to="/profile"><i className='bx bxs-user-account' ></i>Profile</NavLink>
          </li>
          <li>
            <button onClick={logout}><i className='bx bxs-right-arrow-square'></i>{isLoading ? "Exiting" : "Logout"}</button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
