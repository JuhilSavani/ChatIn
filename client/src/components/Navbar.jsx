import React from "react";
import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header>
      <nav>
        <span>
          <Link>ChatIn'</Link>
        </span>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
