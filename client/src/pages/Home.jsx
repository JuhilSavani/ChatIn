import React, { useRef } from "react";
import NoChat from "../components/NoChat";

const Home = () => {
  const dialogRef = useRef(null);

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // todo: connect to the email `[post] /connection/add` with react-query
    console.log("Email submitted:", email);
    closeDialog();
  };
  
  return (
    <div className="page home">
      <div className="container">
        <section className="sidebar">
          <div>
            <span>
              <i className="bx bxs-contact"></i>Contacts
            </span>
            <button className="add-btn" onClick={openDialog}>
              <i className="bx bxs-user-plus"></i>
            </button>
          </div>
          <div></div>
        </section>
        <dialog ref={dialogRef} className="modal">
          <div className="modal-content">
            <h3>Add Contact</h3>
            <form onSubmit={handleSubmit}>
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
                <button className="cancel-btn" onClick={closeDialog}>
                  Cancel
                </button>
                <button type="submit" className="add-btn">
                  Add
                </button>
              </div>
            </form>
          </div>
        </dialog>
        <section className="panel">
          <NoChat />
        </section>
      </div>
    </div>
  );
};

export default Home;


