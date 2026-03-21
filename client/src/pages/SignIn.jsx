import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/apis/axios";
import useSocket from "../utils/hooks/useSocket";
import useAuth from "../utils/hooks/useAuth";
import useValidate from "../utils/hooks/useValidate"
import { toast } from 'react-toastify';
import validator from "validator";
import clsx from "clsx";

const SignIn = () => {
  const { setIsAuthenticated, setUser } = useAuth();
  const { connectSocket } = useSocket();
  const validate = useValidate();

  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPwdLoading, setIsForgotPwdLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) =>{
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    if (typeof userData.email === "string") userData.email = userData.email.trim();

    // Validate the data
    const validationError = validate(userData, { type: "login" });
    if (validationError) {
      toast.error(validationError);
      setIsLoading(false);
      return; 
    }

    try{
      const response = await axios.post("/authorize/login", userData);
      setIsAuthenticated(true);
      setUser(response?.data?.user);
      connectSocket();
      toast.success("Great to see you again, 😍!");
      navigate("/", { replace: true });
    }catch(error){
      console.error(error.stack);
      toast.error(error?.response?.data.message || error?.message);
    }finally{
      setIsLoading(false);
    }
  }

  const handleForgotPwd = async () => {
    const trimmedEmail = email.trim();
    if(!trimmedEmail){
      toast.error("Please enter the email, 😙!");
      return;
    }
    if(!validator.isEmail(trimmedEmail)){ 
      toast.error("Invalid email format, 😑!");
      return;
    }
    setIsForgotPwdLoading(true);
    try{
      const response = await axios.post('/verify/account', { email: trimmedEmail });
      if(!response.data?.isExisting){
        toast.error("Email not found, 😤!");
        return;
      }
    } catch (error) {

    } finally {
      setIsForgotPwdLoading(false);
    }
    
    navigate(`/verify?email=${encodeURIComponent(trimmedEmail)}&referrer=signin`);
  }

  return (
    <div className="page flex h-full min-h-0 w-full items-center justify-center overflow-auto py-2 sm:py-8">
      <div className="grid w-full max-w-5xl lg:min-h-[40rem] xl:min-h-[44rem] lg:grid-cols-2 lg:overflow-hidden lg:rounded-md lg:border-2 lg:border-[#101010]/75 lg:border-b-[5px] lg:bg-beige">
        <section className="grid place-items-center px-2 py-2 sm:p-6 lg:border-r-2 lg:border-r-[#101010]/75">
          <form onSubmit={handleSubmit} noValidate className="mb-0 w-full max-w-xl rounded-md border-2 border-primary-black border-b-[5px] border-b-[#101010]/75 bg-bisque px-4 py-5 sm:p-8">
            <div className="mb-4 text-center lg:hidden">
              <h2 className="text-lg">Welcome Back!</h2>
              <p className="mt-2 font-medium">
                Sign in to continue your conversations and catch up with your
                messages.
              </p>
            </div>
            <label htmlFor="email" className="ml-1 mt-3 mb-1.5 block text-md sm:mt-4 sm:mb-2">Email: </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email here..."
              onChange={(e) => setEmail(e.target.value)}
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
            <span  className={clsx('mx-2 mt-2 block text-sm font-[450] hover:cursor-pointer hover:underline', isForgotPwdLoading && 'opacity-80 hover:!cursor-progress')} onClick={handleForgotPwd}>
              forgot password?
            </span>
            <span className="mt-3 mb-4 block border-2 border-dashed border-secondary-black bg-primary-white px-2 py-1 text-center text-sm sm:mt-4 sm:mb-5">
              Not register yet? <Link to="/sign-up" className="font-[450] ml-1 hover:underline">Sign up</Link>
            </span>
            <button type="submit" className="block w-full bg-primary-white text-inherit rounded-md text-lg py-2 px-6 mx-auto transition-all duration-300 border-2 border-secondary-black hover:ring-[3px] hover:ring-[#101010]/75 cursor-pointer sm:w-auto">
              {isLoading ? "Loading" : "Login"}
            </button>
          </form>
        </section>
        <section className="hidden items-center justify-center p-6 sm:p-10 lg:flex">
          <div className="flex w-full max-w-md flex-col gap-4 text-center">
            <span className="flex flex-col items-center justify-center">
              <i className="bx bxs-message-alt-dots text-[2rem] sm:text-[2.5rem]"></i>
              <h1 className="text-[2rem] sm:text-[2.5rem]">ChatIn'</h1>
            </span>
            <h2 className="text-lg sm:text-xl">Welcome Back!</h2>
            <p className="mx-auto w-full max-w-[28rem] font-medium">
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
