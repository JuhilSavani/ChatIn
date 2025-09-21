import React, { useEffect, useState, useRef } from "react";
import useAuth from "../utils/hooks/useAuth";
import axios from "../utils/apis/axios";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      const timeFormatter = new Intl.DateTimeFormat("en-GB");
      setCreatedAt(timeFormatter.format(new Date(user.createdAt)));
      if (user.hasProfilePic) 
        setProfilePicUrl(`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/profilePics/user_${user.id}`);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const isNameChanged =
      user.name.replace(/\s+/g, "").toLowerCase() !== name.replace(/\s+/g, "").toLowerCase();

    try {
      const formData = new FormData();

      if (isNameChanged) formData.append("name", name); 
      if (profilePic) formData.append("profilePic", profilePic);

      if (!formData.has("name") && !formData.has("profilePic")) { 
        setLoading(false);
        return;
      }

      const response = await axios.put(`/profile/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(response.data?.user);
      setMessage({ type: "success", text: response.data?.message });
      setIsEditing(false);

      // TODO: Implement real-time profile update via sockets
    } catch (err) {
      console.error(err.stack);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page profile">
      <div className="container">
        <section className="profile-pic">
          <h2>Your Profile</h2>
          <div className="pic-wrapper">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" />
            ) : (
              <i className="bx bxs-user-circle"></i>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button type="button" onClick={() => fileInputRef.current.click()}>
              <i className='bx bxs-edit'></i>
            </button>
          </div>
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
              {loading ? "Saving..." : "Save"}
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