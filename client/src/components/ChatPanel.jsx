import React, { useEffect, useRef, useState } from "react";
import useAuth from "../utils/hooks/useAuth";
import useSocket from "../utils/hooks/useSocket";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";

const ChatPanel = ({ contact }) => {
  const { connectionId, connectedUser } = contact;

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

  // Function to scroll to the bottom of the chat area
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    scrollToBottom();  // Scroll to bottom whenever messages change
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
        <input type="text" placeholder="Type a message..." ref={messageRef} />
        <span onClick={handleSendMessage}>
          {isSending ? <i className='bx bx-loader'></i> : <i className="bx bxs-send"></i>}
        </span>
      </section>
    </div>
  );
};

export default ChatPanel;
