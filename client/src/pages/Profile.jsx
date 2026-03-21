import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/hooks/useAuth";
import axios from "../utils/apis/axios";
import { getProfileImageUrl } from "../utils/profileImage";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

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
      setImageError(false);
      setProfilePicUrl(getProfileImageUrl(user));
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
      setImageError(false);
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
      setProfilePic(null);
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
    <div className="grid h-full w-full place-items-center overflow-auto py-4 sm:py-6">
      <div className="flex w-full max-w-[36rem] flex-col bg-beige rounded-md border-2 border-[#101010]/75 border-b-[5px] px-5 py-6 sm:px-8 sm:py-8 md:px-8">
        <section className="flex flex-col font-semibold text-center profile-pic">
          <h2 className="text-[2rem] sm:text-xl">Your Profile</h2>
          <div className="relative mx-auto flex h-[200px] w-[200px] items-center justify-center sm:h-[256px] sm:w-[256px]">
            {profilePicUrl && !imageError ? (
              <img className="block h-[180px] w-[180px] rounded-full object-cover border-[3px] border-primary-black sm:h-[232px] sm:w-[232px]" src={profilePicUrl} alt="Profile" onError={() => setImageError(true)} />
            ) : (
              <i className="bx bxs-user-circle h-[210px] w-[210px] text-[210px] leading-none sm:h-[270px] sm:w-[270px] sm:text-[270px]"></i>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button className="absolute bottom-3 right-3 h-[26px] w-[26px] rounded-[2px] border-none bg-transparent text-primary-black text-[1.35rem] transition-all duration-300 hover:bg-[#444]/10 cursor-pointer z-10 sm:bottom-5 sm:right-5" type="button" onClick={() => fileInputRef.current.click()}>
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

          <div className="flex flex-col gap-1 border-2 border-dashed border-primary-black bg-primary-white p-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Member Since</span>
            <span>{createdAt}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group relative inline-flex min-w-[116px] items-center justify-center overflow-hidden bg-primary-white px-3 py-1.5 text-inherit border-2 border-[#101010]/75 rounded-md font-semibold transition-all duration-200 hover:ring-2 hover:ring-[#101010]/75 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 inline-flex -translate-x-3 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
              >
                <i className="bx bx-left-arrow-alt text-[1.25rem] leading-none"></i>
              </span>
              <span className="mx-auto">Back</span>
            </button>
            <button className="min-w-[100px] bg-green text-inherit p-1.5 border-2 border-[#101010]/75 rounded-md font-semibold hover:ring-2 hover:ring-[#101010]/75 transition-all duration-300 cursor-pointer disabled:opacity-50" onClick={handleSaveChanges} disabled={loading}>
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
