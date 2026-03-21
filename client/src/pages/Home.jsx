import React, { useRef, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

import NoChat from "../components/NoChat";
import useAuth from "../utils/hooks/useAuth";
import addContact from "../utils/controllers/addContact";
import fetchContacts from "../utils/controllers/fetchContacts";
import ChatPanel from "../components/ChatPanel";
import axios from "../utils/apis/axios";
// removed getProfileImageUrl

const Home = () => {
  const { data, isLoading, isError, error } = fetchContacts();

  const { user, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const dialogRef = useRef(null);
  const logoutDialogRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, selectContact] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [search, setSearch] = useState(""); 

  const { mutate: addContactMutate } = addContact();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    closeLogoutDialog();
    try {
      await axios.post('/authorize/logout');
      setIsAuthenticated(false);
      toast.success("Logged out successfully, 😭!");
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error(error?.response?.data?.stack || error.stack);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const openLogoutDialog = () => logoutDialogRef.current?.showModal();
  const closeLogoutDialog = () => logoutDialogRef.current?.close();

  useEffect(() => {
    if (data && data.length) setContacts(data);
  }, [data]);

  const handleAdd = (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    if (email === user.email) {
      toast.error("Please provide a valid email other than yours, 😤!");
      closeDialog();
      return;
    }

    setIsAdding(true);

    addContactMutate({ userId: user.id, email }, {
      onSuccess: () => {
        setIsAdding(false);
        closeDialog();
        toast.success(`You are now connected with ${email}, 🥳!`);
      },
      onError: (err) => {
        setIsAdding(false);
        closeDialog();
        console.error(err?.response?.data?.stack || err.stack);
        toast.error(`Something went wrong while adding ${email}, 😶!`);
      },
    });
  };

  // Filter contacts based on the search 
  const filteredContacts = contacts.filter((contact) =>
    contact.connectedUser.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.connectedUser.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 bg-beige lg:grid-cols-[minmax(18rem,3fr)_minmax(0,7fr)] lg:overflow-hidden lg:rounded-md lg:border-2 lg:border-[#101010]/75 lg:border-b-[5px]">
        <section className={`min-h-0 flex-col overflow-hidden ${selectedContact?.status ? "hidden lg:flex" : "flex"} lg:border-r-2 lg:border-r-[#101010]/75`}>
          <div className="relative m-2 mb-0 flex items-center justify-between overflow-hidden rounded-md border-2 border-[#101010]/75 border-b-[5px] px-3 py-3 sm:px-4">
            <span className="inline-flex items-center gap-2 text-base sm:text-lg">
              <i className="bx bxs-contact text-[1.875rem]"></i>Contacts
            </span>
            <button className="bg-green text-md text-inherit py-[0.1rem] px-2 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" onClick={openDialog}>
              <i className="bx bxs-user-plus text-[1.875rem]"></i>
            </button>
          </div>
          <div className="px-2 pt-2">
            <div className="relative flex items-center mb-2 p-3 bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px]">
              <i className="bx bx-search text-md absolute left-[20px] top-1/2 -translate-y-1/2 -scale-x-100"></i>
              <input type="text" placeholder="Search" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[35px] pr-2 pl-8 text-inherit bg-secondary-white rounded-md text-sm transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-hidden p-2 pt-0">
            <ul className="h-full overflow-y-auto rounded-md border-2 border-[#101010]/75 border-b-[5px]">
              {isLoading && (
                <li className="flex items-center gap-4 p-4 bg-primary-white rounded-md border-b border-primary-black/25">
                  <p><strong>Loading connections...</strong></p>
                </li>
              )}
              {isError && (
                <li className="flex items-center gap-4 p-4 bg-primary-white rounded-md border-b border-primary-black/25">
                  <p><strong>Error: </strong>{error.message}</p>
                </li>
              )}
              {!isLoading && !isError && !Boolean(filteredContacts?.length) && (
                <li className="flex items-center gap-4 p-4 bg-primary-white rounded-md border-b border-primary-black/25">
                  <p><strong>No contacts yet!</strong></p>
                </li>
              )}
              {!isLoading && !isError && Boolean(filteredContacts?.length) &&
                filteredContacts.map((c) => (
                  <li 
                  key={c.id || c.connectedUser.email} 
                  onClick={() => selectContact(c)}
                  className={`flex items-center gap-3 p-3 bg-primary-white rounded-md border-b border-primary-black/25 cursor-pointer transition-colors duration-200 hover:bg-secondary-white sm:gap-4 sm:p-4 ${(selectedContact?.connectedUser?.id === c?.connectedUser?.id) ? "!bg-secondary-white" : ""}`}>
                    {c.connectedUser.profilePicUrl ? (
                      <img
                        className="h-[45px] w-[45px] aspect-square flex-shrink-0 rounded-full border-2 border-primary-black object-cover sm:h-[49px] sm:w-[49px]"
                        src={c.connectedUser.profilePicUrl}
                        alt={c.connectedUser.name}
                      />
                    ) : (
                      <i className="bx bx-user-circle text-[2.8rem] sm:text-[3.125rem]"></i>
                    )}
                    <div className="w-full min-w-0 overflow-hidden">
                      <h2 className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm">{c.connectedUser.name}</h2>
                      <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm">{c.connectedUser.email}</span>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
          {/* Profile footer */}
          <div className="p-2 pt-0">
            <div className="flex items-center gap-3 p-3 bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px]">
              <div onClick={() => navigate("/profile")} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                {user.profilePicUrl ? (
                  <img
                    className="h-[38px] w-[38px] aspect-square flex-shrink-0 rounded-full border-2 border-primary-black object-cover"
                    src={user.profilePicUrl}
                    alt={user.name}
                  />
                ) : (
                  <i className="bx bx-user-circle text-[2.4rem] flex-shrink-0"></i>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</p>
                  <p className="text-xs leading-tight whitespace-nowrap overflow-hidden text-ellipsis opacity-70">{user.email}</p>
                </div>
              </div>
              <div className="relative group flex items-center justify-center">
                <button
                  onClick={openLogoutDialog}
                  disabled={isLoggingOut}
                  className="flex-shrink-0 inline-flex items-center justify-center h-[32px] w-[32px] rounded-md border-none bg-transparent text-primary-black transition-all duration-300 hover:bg-[#F75A5A]/20 hover:text-[#F75A5A] cursor-pointer disabled:opacity-60"
                >
                  <i className='bx bx-arrow-to-right text-[1.8rem]' ></i>
                </button>
                <span className="pointer-events-none absolute -top-[34px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[4px] border-2 border-[#101010]/75 bg-primary-black px-2 py-1 text-[0.7rem] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Logout
                </span>
              </div>
            </div>
          </div>
        </section>
        <dialog ref={dialogRef} className="absolute top-1/2 left-1/2 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-black/25 border-b-[5px] bg-bisque text-primary-black backdrop:bg-primary-black/25">
          <div className="p-5 sm:p-8">
            <h3 className="text-center text-lg border-b-[3px] border-dashed border-primary-black mb-4">Add Contact</h3>
            <form onSubmit={handleAdd}>
              <label className="block text-md ml-2 font-semibold">
                Email:
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email to connect..."
                  className="w-full py-3 px-4 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm mt-1 transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
                  required
                />
              </label>
              <div className="flex justify-center gap-4 mt-6">
                <button type="button" className="bg-primary-white text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center font-semibold h-[45px] hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" onClick={closeDialog}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center font-semibold h-[45px] hover:ring-2 hover:ring-[#101010]/75 cursor-pointer"
                  disabled={isAdding}
                >
                  {isAdding ? <i className="bx bx-loader text-[1.875rem]"></i> : <><i className="bx bxs-check-circle text-[1.875rem] mr-2 hidden"></i>Add</>}
                </button>
              </div>
            </form>
          </div>
        </dialog>
        <dialog ref={logoutDialogRef} className="absolute top-1/2 left-1/2 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-black/25 border-b-[5px] bg-bisque text-primary-black backdrop:bg-primary-black/25">
          <div className="p-5 sm:p-8">
            <h3 className="text-center text-lg border-b-[3px] border-dashed border-primary-black mb-4">Logout</h3>
            <p className="text-sm font-medium mb-6">Are you sure you want to log out of ChatIn?</p>
            <div className="flex justify-center gap-4">
              <button type="button" className="bg-primary-white text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center font-semibold hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" onClick={closeLogoutDialog}>
                Cancel
              </button>
              <button
                type="button"
                className="bg-primary-black text-white text-md py-2 px-4 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center font-semibold hover:bg-secondary-black cursor-pointer disabled:opacity-60"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </dialog>
        <section className={`min-h-0 flex-col overflow-hidden p-2 ${selectedContact?.status ? "flex" : "hidden lg:flex"}`}>
          {selectedContact?.status ? <ChatPanel contact={selectedContact} onBack={() => selectContact({})} /> : <NoChat />}
        </section>
    </div>
  );
};

export default Home;
