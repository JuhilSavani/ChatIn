import React, { useRef, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import NoChat from "../components/NoChat";
import useAuth from "../utils/hooks/useAuth";
import useSocket from "../utils/hooks/useSocket";
import addContact from "../utils/controllers/addContact";
import fetchContacts from "../utils/controllers/fetchContacts";
import ChatPanel from "../components/ChatPanel";

const Home = () => {
  const { data, isLoading, isError, error } = fetchContacts();

  const { user } = useAuth();
  const { socket } = useSocket();
  
  const dialogRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, selectContact] = useState({});

  const { mutate: addContactMutate, isLoading: isAdding } = addContact();

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  useEffect(() => {
    if(data && data.length) setContacts(data);

    if (socket) {
      socket.on("newConnection", (newConnection) => {
        setContacts((prevContacts) => [...prevContacts, newConnection]);
      });
    }

    return () => {
      if (socket) socket.off("newConnection");
    };
  }, [data, socket]);

  const handleCreate = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    try {
      if (email == user.email)
        throw new Error("Please provide a valid email other than yours!");
      addContactMutate({ userId: user.id, email });
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data.message || error.message);
    }
    closeDialog();
  };

  return (
    <div className="page home">
      <div className="container">
        <section className="sidebar">
          <div className="sidebar-header">
            <span>
              <i className="bx bxs-contact"></i>Contacts
            </span>
            <button className="dialog-btn" onClick={openDialog}>
              <i className="bx bxs-user-plus"></i>
            </button>
          </div>
          <div className="contacts">
            <ul>
              {isLoading && (<li className="sidebar-msg"><p><strong>Loading connections...</strong></p></li>)}
              {isError && (<li className="sidebar-msg"><p><strong>Error: </strong> {error.message}</p></li>)}
              {!isLoading && !isError && !Boolean(contacts?.length) && (<li className="sidebar-msg"><p><strong>No contacts yet!</strong></p></li>)}
              {!isLoading && !isError && Boolean(contacts?.length) &&
                contacts.map((c) => (
                  <li key={c.id} onClick={() => selectContact(c)}>
                    <i className="bx bx-user-circle"></i>
                    <div>
                      <h2>{c.connectedUser.name}</h2>
                      <span>{c.connectedUser.email}</span>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </section>
        <dialog ref={dialogRef} className="modal">
          <div className="modal-content">
            <h3>Add Contact</h3>
            <form onSubmit={handleCreate}>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email to connect..."
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeDialog}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-btn"
                  disabled={isAdding}
                >
                  {isAdding ? "..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
        <section className="panel">
          {selectedContact?.status ? <ChatPanel contact={selectedContact}/> : <NoChat />}
        </section>
      </div>
    </div>
  );
};

export default Home;
