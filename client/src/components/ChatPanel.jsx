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
    <div className="grid grid-rows-[12%_auto_12%] h-full max-h-[77vh] min-h-[480px] w-full bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px]">
      <section className="w-full bg-secondary-white p-4 flex items-center gap-4 rounded-t-[4px] border-b border-primary-black/25">
        {connectedUser.hasProfilePic ? (
          <img
            className="w-[49px] h-[49px] rounded-full object-cover border-2 border-primary-black"
            src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/profilePics/user_${connectedUser.id}`}
            alt={connectedUser.name}
          />
        ) : (
          <i className="bx bx-user-circle text-[3.125rem]"></i>
        )}
        <div className="flex flex-col justify-center gap-[6px]">
          <h2 className="text-[1.15rem] font-bold leading-none m-0 p-0">{connectedUser.name}</h2>
          <span className="text-[0.85rem] leading-none m-0 p-0">{connectedUser.email}</span>
        </div>
      </section>
      <section className="w-full px-2 overflow-y-auto" ref={chatAreaRef}>
        {isLoading && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[80%]"><strong>Loading messages...</strong></p>}
        {isError && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[80%]"><strong>Error: </strong>{error.message}</p>}
        {!isLoading && !isError && !Boolean(data?.length) && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[80%]"><strong>No messages yet!</strong></p>}
        {!isLoading && !isError && Boolean(data?.length) &&
          Object.keys(messages).map((date, index) => (
            <div key={date} className={index !== Object.keys(messages).length - 1 ? "pb-2 border-b border-primary-black" : ""}>
              <span className="bg-bisque border-2 border-[#101010]/75 p-2 rounded block my-4 mx-auto text-center w-fit min-w-[150px]">{date}</span>
              {messages[date].map((msg) => (
                <div key={msg.id} className={`flex flex-col my-2 ${msg.sender.id === user.id ? "items-end" : "items-start"}`}>
                  <p className={`flex flex-col border-2 border-[#101010]/75 px-2 pt-2 pb-[2px] max-w-[45%] ${msg.sender.id === user.id ? "bg-green items-end rounded-[6px_0_6px_6px]" : "bg-beige items-start rounded-[0_6px_6px_6px]"}`}>
                    <span className="break-words min-w-0 w-full block text-[0.95rem]">{msg.content}</span>
                    <span className="mt-1 bg-primary-white text-[0.65rem] p-[2px] rounded-[3px] border border-primary-black/25 leading-none">{timeFormatter.format(new Date(msg.timestamp))}</span>
                  </p>
                </div>
              ))}
            </div>
        ))}
      </section>
      <section className="w-full bg-secondary-white p-4 flex items-center gap-4 border-t border-primary-black/25">
        <input type="text" placeholder="Type a message..." ref={messageRef} onKeyDown={handleKeyDown} 
          className="w-[85%] px-3 text-inherit bg-primary-white border-2 border-secondary-black rounded-md text-sm transition-all duration-300 h-[40px] focus:outline-none focus:ring-[3px] focus:ring-[#101010]/75 placeholder:font-normal placeholder:opacity-80"
        />
        <span onClick={handleSendMessage} className="inline-flex justify-center items-center text-[1.875rem] bg-green text-inherit w-[60px] h-[40px] rounded-md border-2 border-[#101010]/75 transition-all duration-300 hover:ring-2 hover:ring-[#101010]/75 cursor-pointer">
          {isSending ? <i className='bx bx-loader text-[1.875rem]'></i> : <i className="bx bxs-send"></i>}
        </span>
      </section>
    </div>
  );
};

export default ChatPanel;