import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/apis/axios";
import useSocket from "../utils/hooks/useSocket";
import useAuth from "../utils/hooks/useAuth";
import useResource from "../utils/hooks/useResource";
import useValidate from "../utils/hooks/useValidate"
import { toast } from 'react-toastify';

const SignUp = () => {
  const { setIsAuthenticated, setUser } = useAuth();
  const { connectSocket } = useSocket();
  const { setResource } = useResource()
  const validate = useValidate();
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    // Validate the data
    const validationError = validate(userData, { type: "register" });
    if (validationError) {
      toast.error(validationError);
      setIsLoading(false);
      return; 
    }

    try {
      await axios.post('/verify/account', { email: userData.email });
      if(import.meta.env.VITE_NODE_ENV === "development"){
        const { data } = await axios.post('/authorize/register', userData);
        setIsAuthenticated(true);
        setUser(data?.user);
        connectSocket();
        toast.success("Registration successful!");
        navigate("/", { replace: true });
      }else{
        const { data } =  await axios.get(`/verify/${userData.email}`);
        setResource({userData, verificationCode: data?.verificationCode });
        toast.success("Verification code sent to your email.");
        navigate(`/verify/${userData.email}`);
      }
    } catch (error) {
      console.error(error.stack);
      toast.error(error?.response?.data.message || error?.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="page sign-up">
      <div className="container">
        <section className="form-area">
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
        <section className="greeting-area">
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
