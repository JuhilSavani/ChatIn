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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="page flex h-full min-h-0 w-full items-center justify-center overflow-auto py-2 sm:py-8">
      <div className="grid w-full max-w-5xl lg:min-h-[40rem] xl:min-h-[44rem] lg:grid-cols-2 lg:overflow-hidden lg:rounded-md lg:border-2 lg:border-[#101010]/75 lg:border-b-[5px] lg:bg-beige">
        <section className="grid place-items-center px-2 py-2 sm:p-6 lg:border-r-2 lg:border-r-[#101010]/75">
          <form onSubmit={handleSubmit} noValidate className="mb-0 w-full max-w-xl rounded-md border-2 border-primary-black border-b-[5px] border-b-[#101010]/75 bg-bisque px-4 py-5 sm:p-8">
            <div className="mb-4 text-center lg:hidden">
              <h2 className="text-lg">Join our community!</h2>
              <p className="mt-2 font-medium">
                Connect with friends, share moments, and stay in touch with your
                loved ones.
              </p>
            </div>
            <label htmlFor="name" className="ml-1 mt-3 mb-1.5 block text-md sm:mt-4 sm:mb-2">Name: </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name here...  "
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <label htmlFor="email" className="ml-1 mt-3 mb-1.5 block text-md sm:mt-4 sm:mb-2">Email: </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email here..."
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <label htmlFor="password" className="ml-1 mt-3 mb-1.5 block text-md sm:mt-4 sm:mb-2">Password: </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password here..."
                className="block w-full py-3 px-4 pr-10 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-black text-[1.4rem] opacity-70 transition-opacity hover:opacity-100 p-1 flex items-center justify-center cursor-pointer bg-transparent border-none"
                tabIndex="-1"
              >
                {showPassword ? <i className='bx bx-hide'></i> : <i className='bx bx-show'></i>}
              </button>
            </div>
            <span className="mt-3 mb-4 block border-2 border-dashed border-secondary-black bg-primary-white px-2 py-1 text-center text-sm sm:mt-4 sm:mb-5">
              Already have an account? <Link to="/sign-in" className="font-[450] ml-1 hover:underline">Sign in</Link>
            </span>
            <button type="submit" className="block w-full bg-primary-white text-inherit rounded-md text-lg py-2 px-6 mx-auto transition-all duration-300 border-2 border-secondary-black hover:ring-[3px] hover:ring-[#101010]/75 cursor-pointer sm:w-auto">
              {isLoading ? "Loading": "Register"}
            </button>
          </form>
        </section>
        <section className="hidden items-center justify-center p-6 sm:p-10 lg:flex">
          <div className="flex w-full max-w-md flex-col gap-4 text-center">
            <span className="flex flex-col items-center justify-center">
              <i className="bx bxs-message-alt-dots text-[2rem] sm:text-[2.5rem]"></i>
              <h1 className="text-[2rem] sm:text-[2.5rem]">ChatIn'</h1>
            </span>
            <h2 className="text-lg sm:text-xl">Join our community!</h2>
            <p className="mx-auto w-full max-w-[28rem] font-medium">
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
