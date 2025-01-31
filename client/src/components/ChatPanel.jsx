import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../utils/hooks/useAuth";
import useSocket from "../utils/hooks/useSocket";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";
import { toast } from "react-toastify";

const ChatPanel = ({ contact }) => {
  const { connectionId, connectedUser } = contact;

  const queryClient = useQueryClient();
  
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messageRef = useRef(null);
  const chatAreaRef = useRef(null);  

  const { data, isLoading, isError, error } = fetchMessages(connectionId);
  const { mutate: sendMsg } = sendMessage();

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  useEffect(() => {
    if (data && data.length) setMessages(data);
    else setMessages([]);

    if (socket) {
      socket.on("newMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        queryClient.setQueryData(["messages", connectionId], (oldMessages = []) => {
          return [...oldMessages, newMessage];
        });
        toast.success(`New message from ${newMessage.sender.email}`);
      });
    }

    return () => {
      if (socket) socket.off("newMessage");
    };
  }, [data, socket, queryClient, connectionId]);

  // Scroll down to the bottom on message state update
  useEffect(() => {
    chatAreaRef.current 
    && (chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight);
  }, [messages]);

  const handleSendMessage = () => {
    const messageContent = messageRef.current.value.trim();
    if (!messageContent || isSending) return;
    const data = {
      connectionId,
      senderId: user.id,
      recieverId: connectedUser.id,
      content: messageContent,
    };
    setIsSending(true);
    sendMsg(data, {
      onSuccess: () => {
        setIsSending(false);
        messageRef.current.value = "";
      },
      onError: () => {
        setIsSending(false);
        messageRef.current.value = "";
      },
    });
  };

  const handleKeyDown = (e) => {
    if(e.key === "Enter"){
      e.preventDefault();  
      handleSendMessage();
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
      <section className="chat-area" ref={chatAreaRef}>
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
        <input type="text" placeholder="Type a message..." ref={messageRef} onKeyDown={handleKeyDown} />
        <span onClick={handleSendMessage}>
          {isSending ? <i className='bx bx-loader'></i> : <i className="bx bxs-send"></i>}
        </span>
      </section>
    </div>
  );
};

export default ChatPanel;
