import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import useAuth from "../utils/hooks/useAuth";
import useResource from "../utils/hooks/useResource";
import useSocket from "../utils/hooks/useSocket";
import axios from "../utils/apis/axios";

const EmailVerify = () => {
  const { setIsAuthenticated, setUser } = useAuth();
  const { connectSocket } = useSocket();
  const { resource, setResource } = useResource();

  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const referrer = searchParams.get("referrer"); 

  const navigate = useNavigate();

  useEffect(() => {
    if (!referrer || !email) {
      toast.error("Please register first, 😤!");
      navigate("/sign-up", { replace: true });
      return;
    }

    if (referrer === "signup" && !resource?.userData) {
      toast.error("Please register first, 😤!");
      navigate("/sign-up", { replace: true });
    }
  }, [email, referrer, navigate, resource, setResource]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const { verificationCode: enteredCode } = Object.fromEntries(formData.entries());
    try {
      if(!enteredCode){
        toast.error("Please enter the verification code, 😤!");
        setIsLoading(false);
        return;
      }
      if(parseInt(enteredCode) !== parseInt(resource.verificationCode)){
        toast.error("Invalid verification code, 😩!");
        setIsLoading(false);
        return;
      }
      if(referrer == 'signup'){
        const { data } = await axios.post('/authorize/register', resource.userData);
        setIsAuthenticated(true);
        setUser(data?.user);
        setResource({});
        connectSocket();
        toast.success("Registration successful, 🥳!");
        navigate("/", { replace: true });
      }else{
        const { data } = await axios.post('/authorize/passwordlessLogin', { email });
        setIsAuthenticated(true);
        setUser(data?.user);
        connectSocket();
        toast.success("Great to see you again, 😍!");
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSend = async (event) => {
    event.preventDefault();
    setIsSending(true);
    try {
      const response =  await axios.get(`/verify/${email}`);
      setResource((prevData) => ({ ...prevData, ...response.data }));
      toast.info("Please check your email to get verification code, 🤗!");
    } catch(error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error("Something went wrong while sending the confirmation email, 😶!");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="page flex min-h-full w-full items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-[500px] rounded-md border-2 border-[#101010]/75 border-b-[5px] bg-beige px-4 pb-4 pt-4 text-sm sm:px-8">
        <span className="block h-[110px] text-center text-[6rem] sm:h-[150px] sm:text-[9rem]"><i className='bx bxs-envelope'></i></span>
        <h1 className="text-center text-[1.9rem] sm:text-xl">Verify your email address</h1>
        <p className="text-center">Please check your inbox for a verification email.</p>
        <p className="text-center">If you haven&apos;t received it, you can request a new one.</p>
        <form className="my-4 px-0 sm:px-4" onSubmit={handleVerify}>
          <label htmlFor="email" className="block font-semibold mb-1">Your Email Account:</label>
          <input type="email" id="email" name="email" 
            value={email} 
            placeholder="..." 
            className="px-4 h-[40px] w-full block mb-4 bg-primary-white text-inherit rounded-md text-sm border-2 border-[#101010]/75 transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 hover:cursor-not-allowed placeholder:text-xl sm:placeholder:text-[1.875rem]"
            required 
            readOnly
          />  
          <label htmlFor="verificationCode" className="block font-semibold mb-1">Enter Verification Code:</label>
          <input type="text" id="verificationCode" name="verificationCode" placeholder="..." className="px-4 h-[40px] w-full block mb-4 bg-primary-white text-inherit rounded-md text-sm border-2 border-[#101010]/75 transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:text-xl sm:placeholder:text-[1.875rem]" required/>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="bg-green text-inherit rounded-md text-md px-4 h-[40px] border-2 border-[#101010]/75 transition-all duration-300 hover:ring-2 hover:ring-[#101010]/75 cursor-pointer">{ isLoading ? "Verifying" : "Verify" }</button>
            <button className="bg-primary-white text-inherit rounded-md text-md px-4 h-[40px] border-2 border-[#101010]/75 transition-all duration-300 hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" onClick={handleSend}>{ isSending ? "Sending" : "Send" }</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
