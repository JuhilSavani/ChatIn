import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/apis/axios";
import useSocket from "../utils/hooks/useSocket";
import useAuth from "../utils/hooks/useAuth";

const SignIn = () => {
  const { setIsAuthenticated, setUser } = useAuth();
  const { connectSocket } = useSocket();

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (event) =>{
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    // todo: add validation layer here...
    try{
      const response = await axios.post("/authorize/login", userData);
      setIsAuthenticated(true);
      setUser(response?.data?.user);
      connectSocket();
      navigate("/", { replace: true });
    }catch(error){
      console.error(error.stack);
      alert(error?.response?.data.message || error?.message);
    }finally{
      setIsLoading(false);
    }
  }

  return (
    <div className="page sign-in">
      <div className="container">
        <section className="form-area">
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email: </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email here..."
              required
            />
            <label htmlFor="password">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password here..."
              required
            />
            <span>
              Not register yet? <Link to="/sign-up">Sign up</Link>
            </span>
            <button type="submit">{isLoading ? "Loading" : "Login"}</button>
          </form>
        </section>
        <section className="greeting-area">
          <div>
            <span>
              <i className="bx bxs-message-alt-dots"></i>
              <h1>ChatIn'</h1>
            </span>
            <h2>Welcome Back!</h2>
            <p>
              Sign in to continue your conversations and catch up with your
              messages.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignIn;
