import React, { useEffect, useRef } from "react";
import useAuth from "../utils/hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const dateRef = useRef(null);
  useEffect(()=>{
    nameRef.current.value = user.name;
    emailRef.current.value = user.email;
    const isoDate = user.createdAt;
    const formattedDate = new Intl.DateTimeFormat('en-GB').format(new Date(isoDate));
    dateRef.current.textContent = formattedDate;
  }, [user]);

  return (
    <div className="page profile">
      <div className="container">
        <section className="profile-pic">
          <h2>Profile</h2>
          <span>Your profile information</span>
          <i className="bx bxs-user-rectangle"></i>
        </section>
        <section className="profile-info">
          <form noValidate>
            <label htmlFor="name">Full Name: </label>
            <input type="text" name="name" id="name" ref={nameRef} disabled/>
            <label htmlFor="email">Email: </label>
            <input type="email" name="email" id="email" ref={emailRef} disabled/>
          </form>
          <h3>Account Information</h3>
          <div><span>Member Since</span> <span ref={dateRef}></span></div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
