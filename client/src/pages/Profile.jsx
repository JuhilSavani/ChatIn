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
  const [imageError, setImageError] = useState(false);

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
    <div className="min-h-[calc(100vh-80px)] grid place-items-center page py-8">
      <div className="flex flex-col min-w-[500px] py-8 px-12 w-[40vw] bg-beige rounded-md border-2 border-[#101010]/75 border-b-[5px]">
        <section className="flex flex-col font-semibold text-center profile-pic">
          <h2 className="text-xl">Your Profile</h2>
          <div className="relative w-[256px] h-[256px] flex justify-center items-center mx-auto">
            {profilePicUrl && !imageError ? (
              <img className="block w-[232px] h-[232px] rounded-full object-cover border-[3px] border-primary-black" src={profilePicUrl} alt="Profile" onError={() => setImageError(true)} />
            ) : (
              <i className="bx h-[270px] w-[270px] bxs-user-circle text-[270px] leading-none"></i>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button className="h-[26px] w-[26px] absolute bottom-5 right-5 border-none bg-transparent text-primary-black text-[1.35rem] rounded-[2px] transition-all duration-300 hover:bg-[#444]/10 cursor-pointer z-10" type="button" onClick={() => fileInputRef.current.click()}>
              <i className='bx bxs-edit'></i>
            </button>
          </div>
        </section>

        <section className="flex flex-col profile-info">
          <form noValidate className="mb-4">
            <label htmlFor="name" className="block text-sm ml-2 font-semibold">Full Name: </label>
            <div className="relative">
              <input
                 className={`w-full py-2 px-4 text-inherit rounded-md text-sm mt-[5px] transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 ${(!isEditing || loading) ? "cursor-not-allowed bg-primary-white/60" : "bg-primary-white"}`}
                type="text"
                id="name"
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing || loading}
              />
              <button
                className="h-[26px] w-[26px] absolute right-[10px] translate-y-1/2 border-none bg-transparent text-primary-black text-[1.35rem] rounded-[2px] transition-all duration-300 hover:bg-[#444]/10 cursor-pointer disabled:opacity-50 z-10"
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
              <i className='bx bxs-edit'></i>
              </button>
            </div>

            <label htmlFor="email" className="block text-sm ml-2 mt-4 font-semibold">Email: </label>
            <input className="w-full py-2 px-4 text-inherit bg-primary-white/60 rounded-md text-sm mt-[5px] transition-all duration-300 border-2 border-secondary-black cursor-not-allowed" type="email" id="email" value={email} disabled />
          </form>

          <div className="flex justify-between p-1 border-2 border-dashed border-primary-black bg-primary-white mt-2">
            <span>Member Since</span> <span>{createdAt}</span>
          </div>

          <div className="flex justify-end mt-4">
            <button className="w-[100px] bg-green text-inherit p-1.5 border-2 border-[#101010]/75 rounded-md font-semibold hover:ring-2 hover:ring-[#101010]/75 transition-all duration-300 cursor-pointer disabled:opacity-50" onClick={handleSaveChanges} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button> 
          </div>

           {message && (
            <p className={`px-1 mt-2 ${message.type === "success" ? "bg-green text-primary-black" : "bg-[#F75A5A] text-white"}`}>
              {message.text}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;