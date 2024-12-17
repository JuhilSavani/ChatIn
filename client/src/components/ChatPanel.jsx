import React, { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import useAuth from "../utils/hooks/useAuth";
import useSocket from "../utils/hooks/useSocket";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";

const ChatPanel = ({ contact }) => {

  const { connectionId, connectedUser } = contact;

  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const messageRef = useRef(null);
  
  const { data, isLoading, isError, error } = fetchMessages(connectionId);
  const { mutate: sendMsg } = sendMessage();

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  useEffect(() =>{
    if (data && data.length) setMessages(data);

    if (socket) {
      socket.on("newMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }

    return () => {
      if (socket) socket.off("newMessage"); 
    };
  }, [data, socket]);

  const handleSendMessage = () => {
    const messageContent = messageRef.current.value.trim();
    if (!messageContent) return;
    try {
      sendMsg({
        connectionId,
        senderId: user.id,
        recieverId: connectedUser.id,
        content: messageContent,
      });
      messageRef.current.value = "";
    } catch (error) {
      console.error(error?.response?.data.stack || error.stack);
      toast.error(error?.response?.data.message || error.message);
    }
  };

  return (
    <div className="chat-panel">
      <section className="contact-info">
        <i className="bx bx-user-circle"></i>
        <div>
          <h2>{connectedUser.name}</h2>
          <span>{connectedUser.email}</span>
        </div>
      </section>
      <section className="chat-area">
        {isLoading && <p><strong>Loading messages...</strong></p>}
        {isError && <p><strong>Error: </strong>{error.message}</p>}
        {!isLoading && !isError && !Boolean(messages?.length) && <p><strong>No messages yet!</strong></p>}
        {!isLoading && !isError && Boolean(messages?.length) &&
          messages?.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender.id === user.id ? "sent" : "received"}`}>
              <p>
                <span className="content">{msg.content}</span>
                <span className="timestamp">{timeFormatter.format(new Date(msg.timestamp))}</span>
              </p>
            </div>
        ))}
      </section>
      <section className="message-input">
        <input type="text" placeholder="Type a message..." ref={messageRef}/>
        <span onClick={handleSendMessage}>
          <i className="bx bxs-send"></i>
        </span>
      </section>
    </div>
  );
};

export default ChatPanel;
