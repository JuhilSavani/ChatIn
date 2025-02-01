import React, { useEffect, useRef, useState } from "react";
import useAuth from "../utils/hooks/useAuth";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";

const ChatPanel = ({ contact }) => {
  const { connectionId, connectedUser } = contact;
  const { user } = useAuth();

  const [messages, setMessages] = useState({});
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

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Helper to compare dates
  const isToday = (date) => {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      yesterday.getDate() === date.getDate() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getFullYear() === date.getFullYear()
    );
  };

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp);
    return (
      isToday(messageDate) ? "Today" :
      (isYesterday(messageDate) ? "Yesterday" :  
      dateFormatter.format(messageDate))
    );
  };

  useEffect(() => {
    if(data && data.length){
      const groupedMessages = {};

      data.forEach((msg) => {
        const date = formatTimestamp(msg.timestamp);
        if(!groupedMessages[date]) groupedMessages[date] = [];
        groupedMessages[date].push(msg);
      });

      setMessages(groupedMessages);
    }else setMessages({});
  }, [data]);

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
    if (e.key === "Enter") {
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
        {!isLoading && !isError && !Boolean(data?.length) && <p><strong>No messages yet!</strong></p>}
        {!isLoading && !isError && Boolean(data?.length) &&
          Object.keys(messages).map((date) => (
            <div key={date}>
              <span className="message-date">{date}</span>
              {messages[date].map((msg) => (
                <div key={msg.id} className={`message ${msg.sender.id === user.id ? "sent" : "received"}`}>
                  <p>
                    <span className="content">{msg.content}</span>
                    <span className="timestamp">{timeFormatter.format(new Date(msg.timestamp))}</span>
                  </p>
                </div>
              ))}
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