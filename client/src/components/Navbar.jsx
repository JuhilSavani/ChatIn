import React from "react";
import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header>
      <nav>
        <span><Link>Logo</Link></span>
        <ul>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/sign-in">Login</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
