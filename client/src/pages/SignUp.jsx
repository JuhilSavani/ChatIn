import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/apis/axios";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    // todo: add validation layer here...
    try {
      await axios.post('/authorize/register', userData);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error.stack);
      alert(error?.response?.data.message || error?.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="page sign-up">
      <div className="container">
        <section className="form-section">
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">Name: </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name here...  "
              required
            />
            <label htmlFor="email">Email: </label>
            <input
              type="email"
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
              Already have an account? <Link to="/sign-in">Sign in</Link>
            </span>
            <button type="submit">{isLoading ? "Loading": "Register"}</button>
          </form>
        </section>
        <section className="greet-section">
          <div>
            <span>
              <i className="bx bxs-message-alt-dots"></i>
              <h1>ChatIn'</h1>
            </span>
            <h2>Join our community!</h2>
            <p>
              Connect with friends, share moments, and stay in touch with your
              loved ones.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
