import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

  const { email } = useParams();
  const navigate = useNavigate();
  
  const handleVerify = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const { verificationCode: enteredCode } = Object.fromEntries(formData.entries());
    try {

      if(!enteredCode){
        toast.error("Verification code is required.");
        setIsLoading(false);
        return;
      }
      if(parseInt(enteredCode) !== parseInt(resource.verificationCode)){
        toast.error("Invalid verification code.");
        setIsLoading(false);
        return;
      }

      const { data } = await axios.post('/authorize/register', resource.userData);
      setIsAuthenticated(true);
      setUser(data?.user);
      setResource({});
      connectSocket();
      toast.success("Registration successful!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResend = async (event) => {
    event.preventDefault();
    setIsSending(true);
    try {
      const { data } =  await axios.get(`/verify/${email}`);
      setResource((prev) => ({ ...prev, verificationCode: data?.verificationCode }));
      toast.success( "Verification code sent to your email.");
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data || error.message);
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
          <label htmlFor="verificationCode">Enter Verification Code:</label>
          <input type="text" id="verificationCode" name="verificationCode" placeholder="..." />
          <button className="resend-btn" onClick={handleResend}>{ isSending ? "Sending" : "Resend" }</button>
          <button type="submit" className="verify-btn">{ isLoading ? "Verifying" : "Verify" }</button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
