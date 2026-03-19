import React, { useRef, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import NoChat from "../components/NoChat";
import useAuth from "../utils/hooks/useAuth";
import addContact from "../utils/controllers/addContact";
import fetchContacts from "../utils/controllers/fetchContacts";
import ChatPanel from "../components/ChatPanel";

const Home = () => {
  const { data, isLoading, isError, error } = fetchContacts();

  const { user } = useAuth();
  
  const dialogRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, selectContact] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState(""); 

  const { mutate: addContactMutate } = addContact();

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

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
    <div className="h-[calc(100vh-80px)] grid place-items-center page">
      <div className="grid grid-cols-[3fr_7fr] min-w-[880px] min-h-[500px] w-[80vw] h-[80vh] bg-beige rounded-md border-2 border-[#101010]/75 border-b-[5px]">
        <section className="flex flex-col h-full overflow-y-hidden rounded-l-md border-r-2 border-[#101010]/75">
          <div className="relative flex justify-between items-center px-4 py-3 m-2 rounded-md border-2 border-[#101010]/75 border-b-[5px] overflow-hidden pt-5 group">
            <div className="absolute grid place-items-center top-0 py-3 px-4 w-[90%] left-1/2 -translate-x-1/2 -translate-y-[80%] rounded-b-md border-2 border-[#101010]/75 border-t-0 border-b-[5px] transition-all duration-300 ease-in-out hover:translate-y-0 bg-primary-white z-10">
              <i className="bx bx-search text-md absolute top-1/2 left-[25px] -translate-y-1/2 -scale-x-100"></i>
              <input type="text" placeholder="Search" value={search}
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full h-[35px] pr-2 pl-8 text-inherit bg-secondary-white rounded-md text-sm transition-all duration-300 border-2 border-secondary-black focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
              />
            </div>
            <span className="inline-flex gap-2 items-center text-lg">
              <i className="bx bxs-contact text-[1.875rem]"></i>Contacts
            </span>
            <button className="bg-green text-md text-inherit py-[0.1rem] px-2 rounded-md border-2 border-[#101010]/75 transition-all duration-300 inline-flex items-center hover:ring-2 hover:ring-[#101010]/75 cursor-pointer" onClick={openDialog}>
              <i className="bx bxs-user-plus text-[1.875rem]"></i>
            </button>
          </div>
          <div className="overflow-y-hidden flex-1 p-2">
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
                  className={`flex items-center gap-4 p-4 bg-primary-white rounded-md border-b border-primary-black/25 cursor-pointer hover:bg-secondary-white transition-colors duration-200 ${(selectedContact?.connectedUser?.id === c?.connectedUser?.id) ? "!bg-secondary-white" : ""}`}>
                    {c.connectedUser.hasProfilePic ? (
                      <img
                        className="w-[49px] h-[49px] rounded-full object-cover border-2 border-primary-black"
                        src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/profilePics/user_${c.connectedUser.id}`}
                        alt={c.connectedUser.name}
                      />
                    ) : (
                      <i className="bx bx-user-circle text-[3.125rem]"></i>
                    )}
                    <div className="w-full overflow-hidden">
                      <h2 className="block text-sm whitespace-nowrap overflow-hidden text-ellipsis w-[90%]">{c.connectedUser.name}</h2>
                      <span className="block text-sm whitespace-nowrap overflow-hidden text-ellipsis w-[90%]">{c.connectedUser.email}</span>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </section>
        <dialog ref={dialogRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black/25 border-b-[5px] rounded-md w-[400px] backdrop:bg-primary-black/25 bg-bisque text-primary-black">
          <div className="p-8">
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
        <section className="grid place-items-center p-2">
          {selectedContact?.status ? <ChatPanel contact={selectedContact}/> : <NoChat />}
        </section>
      </div>
    </div>
  );
};

export default Home;
