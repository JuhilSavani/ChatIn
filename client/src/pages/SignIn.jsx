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
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center page py-8">
      <div className="w-[80vw] bg-beige rounded-md grid grid-cols-2 min-w-[700px] min-h-[580px] border-2 border-[#101010]/75 border-b-[5px]">
        <section className="grid place-items-center border-r-2 border-[#101010]/75">
          <form onSubmit={handleSubmit} noValidate className="bg-bisque p-8 border-2 border-primary-black w-[80%] rounded-md mb-4 border-b-[5px] border-b-[#101010]/75">
            <label htmlFor="email" className="block text-md mt-4 mb-2 ml-1">Email: </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter your email here..."
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <label htmlFor="password" className="block text-md mt-4 mb-2 ml-1">Password: </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password here..."
              className="block w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              required
            />
            <span  className={clsx('block text-sm m-2 font-[450] hover:cursor-pointer hover:underline', isForgotPwdLoading && 'opacity-80 hover:!cursor-progress')} onClick={handleForgotPwd}>
              forgot password?
            </span>
            <span className="block text-sm text-center py-1 px-2 mt-4 mb-5 bg-primary-white border-2 border-dashed border-secondary-black">
              Not register yet? <Link to="/sign-up" className="font-[450] ml-1 hover:underline">Sign up</Link>
            </span>
            <button type="submit" className="block bg-primary-white text-inherit rounded-md text-lg py-2 px-6 mx-auto transition-all duration-300 border-2 border-secondary-black hover:ring-[3px] hover:ring-[#101010]/75 cursor-pointer">
              {isLoading ? "Loading" : "Login"}
            </button>
          </form>
        </section>
        <section className="relative">
          <div className="flex flex-col gap-4 absolute top-[30%] left-1/2 -translate-x-1/2 w-full text-center">
            <span className="flex flex-col items-center justify-center">
              <i className="bx bxs-message-alt-dots text-[2.5rem]"></i>
              <h1 className="text-[2.5rem]">ChatIn'</h1>
            </span>
            <h2>Welcome Back!</h2>
            <p className="mx-auto w-[60%] font-medium">
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
