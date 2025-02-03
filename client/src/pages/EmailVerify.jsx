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
    <div className="page verify">
      <div className="container">
        <span><i className='bx bxs-envelope'></i></span>
        <h1>Verify your email address</h1>
        <p>Please check your inbox for a verification email.</p>
        <p>If you haven&apos;t received it, you can request a new one.</p>
        <form className="verify-form" onSubmit={handleVerify}>
          <label htmlFor="email">Your Email Account:</label>
          <input type="email" id="email" name="email" 
            value={email} 
            placeholder="..." 
            required 
            readOnly
          />  
          <label htmlFor="verificationCode">Enter Verification Code:</label>
          <input type="text" id="verificationCode" name="verificationCode" placeholder="..." required/>
          <button type="submit" className="verify-btn">{ isLoading ? "Verifying" : "Verify" }</button>
          <button className="resend-btn" onClick={handleSend}>{ isSending ? "Sending" : "Send" }</button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
