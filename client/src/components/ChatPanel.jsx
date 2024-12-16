import React from "react";

const ChatPanel = ({ contact }) => {
  return (
    <div className="chat-panel">
      <section className="contact-info">
        <i className='bx bx-user-circle'></i>
        <div>
          <h2>{contact.connectedUser.name}</h2>
          <span>{contact.connectedUser.email}</span>
        </div>
      </section>
      <section className="chat-area"></section>
      <section className="message-input">
          <input type="text" />
          <span><i className='bx bxs-send'></i></span>
      </section>
    </div>
  );
};

export default ChatPanel;
