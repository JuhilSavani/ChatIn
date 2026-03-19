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
    if (typeof userData.name === "string") userData.name = userData.name.trim();
    if (typeof userData.email === "string") userData.email = userData.email.trim();

    // Validate the data
    const validationError = validate(userData, { type: "register" });
    if (validationError) {
      toast.error(validationError);
      setIsLoading(false);
      return; 
    }

    try {
      const response = await axios.post('/verify/account', { email: userData.email });
      if(response.data?.isExisting){
        toast.error("Email already exists, 😙!");
        return;
      }
      if(import.meta.env.VITE_NODE_ENV === "development"){
        const { data } = await axios.post('/authorize/register', userData);
        setIsAuthenticated(true);
        setUser(data?.user);
        connectSocket();
        toast.success("Registration successful, 🥳!");
        navigate("/", { replace: true });
      } else {
        // Persist user data for the verify step (in-memory only)
        setResource({ userData });
        navigate(`/verify?email=${encodeURIComponent(userData.email)}&referrer=signup`);
      }
    } catch (error) {
      console.error(error.stack);
      toast.error(error?.response?.data.message || error?.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center page py-8">
      <div className="w-[80vw] bg-beige rounded-md grid grid-cols-2 min-w-[700px] min-h-[580px] border-2 border-[#101010]/75 border-b-[5px]">
        <section className="grid place-items-center border-r-2 border-[#101010]/75">
          <form onSubmit={handleSubmit} noValidate className="bg-bisque p-8 border-2 border-primary-black w-[80%] rounded-md mb-4 border-b-[5px] border-b-[#101010]/75">
            <label htmlFor="name" className="block text-md mt-4 mb-2 ml-1">Name: </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name here...  "
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-none rounded-md text-sm transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <label htmlFor="email" className="block text-md mt-4 mb-2 ml-1">Email: </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email here..."
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-none rounded-md text-sm transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <label htmlFor="password" className="block text-md mt-4 mb-2 ml-1">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password here..."
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-none rounded-md text-sm transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <span className="block text-sm text-center py-1 px-2 mt-4 mb-5 bg-primary-white border-2 border-dashed border-secondary-black">
              Already have an account? <Link to="/sign-in" className="font-[450] ml-1 hover:underline">Sign in</Link>
            </span>
            <button type="submit" className="block bg-primary-white text-inherit rounded-md text-lg py-2 px-6 mx-auto transition-all duration-300 border-2 border-secondary-black hover:ring-[3px] hover:ring-[#101010]/75 cursor-pointer">
              {isLoading ? "Loading": "Register"}
            </button>
          </form>
        </section>
        <section className="relative">
          <div className="flex flex-col gap-4 absolute top-[30%] left-1/2 -translate-x-1/2 w-full text-center">
            <span className="flex flex-col items-center justify-center">
              <i className="bx bxs-message-alt-dots text-[2.5rem]"></i>
              <h1 className="text-[2.5rem]">ChatIn'</h1>
            </span>
            <h2>Join our community!</h2>
            <p className="mx-auto w-[60%] font-medium">
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
