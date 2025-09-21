import React, { useEffect, useState, useRef } from "react";
import useAuth from "../utils/hooks/useAuth";
import axios from "../utils/apis/axios";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      const timeFormatter = new Intl.DateTimeFormat("en-GB");
      setCreatedAt(timeFormatter.format(new Date(user.createdAt)));
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (user.name.replace(/\s+/g, "").toLowerCase() === name.replace(/\s+/g, "").toLowerCase()) {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await axios.put(`/profile/name/${user.id}`, { name });

      setUser(data.user);
      setMessage({ type: "success", text: data.message });
      setIsEditing(false);

      // TODO: Implement real-time profile update via sockets
    } catch (err) {
      console.error(err.stack);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className="editable-input">
              <input
                type="text"
                id="name"
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing || loading}
              />
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <i className='bx bxs-edit'></i>
              </button>
            </div>

            <label htmlFor="email">Email: </label>
            <input type="email" id="email" value={email} disabled />
          </form>

          <div className="extra-profile-metadata">
            <span>Member Since</span> <span>{createdAt}</span>
          </div>

          <div className="save-btn">
            <button onClick={handleSaveChanges}  disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button> 
          </div>

          {message && (
            <p className={message.type === "success" ? "msg msg-success" : "msg msg-error"}>
              {message.text}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;