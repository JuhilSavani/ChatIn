import React, { useEffect, useRef, useState } from "react";
import useAuth from "../utils/hooks/useAuth";
import fetchMessages from "../utils/controllers/fetchMessages";
import sendMessage from "../utils/controllers/sendMessage";

const ChatPanel = ({ contact, onBack }) => {
  const { connectionId, connectedUser } = contact;
  const { user } = useAuth();

  const [messages, setMessages] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState(null);
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
  }, [messages, optimisticMessage]);

  const handleSendMessage = () => {
    const messageContent = inputText.trim();
    if (!messageContent || isSending) return;
    const data = {
      connectionId,
      senderId: user.id,
      recieverId: connectedUser.id,
      content: messageContent,
    };
    setIsSending(true);
    setOptimisticMessage(messageContent);
    setInputText("");
    if (messageRef.current) {
      messageRef.current.style.height = "auto";
    }
    
    sendMsg(data, {
      onSuccess: () => {
        setIsSending(false);
        setOptimisticMessage(null);
      },
      onError: () => {
        setIsSending(false);
        setOptimisticMessage(null);
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-primary-white rounded-md border-2 border-[#101010]/75 border-b-[5px]">
      <section className="w-full bg-secondary-white p-3 sm:p-4 flex items-center gap-3 sm:gap-4 rounded-t-[4px] border-b border-primary-black/25">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to contacts"
              className="inline-flex items-center justify-center p-0 text-primary-black/70 transition-all duration-200 hover:-translate-x-0.5 hover:text-primary-black focus:outline-none active:-translate-x-1 lg:hidden"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width={36}
                height={36}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.29 6.29 8.59 12l5.7 5.71 1.42-1.42-4.3-4.29 4.3-4.29z"></path>
              </svg>
            </button>
          )}
          {onBack && <span aria-hidden="true" className="h-10 w-[3px] bg-primary-black ml-1 mr-2 lg:hidden"></span>}
          {connectedUser.hasProfilePic ? (
            <img
              className="h-11 w-11 rounded-full object-cover border-2 border-primary-black sm:h-[49px] sm:w-[49px]"
              src={`https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/profilePics/user_${connectedUser.id}`}
              alt={connectedUser.name}
            />
          ) : (
            <i className="bx bx-user-circle text-[2.75rem] sm:text-[3.125rem]"></i>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-[6px]">
          <h2 className="m-0 truncate p-0 text-[1rem] font-bold leading-none sm:text-[1.15rem]">{connectedUser.name}</h2>
          <span className="m-0 truncate p-0 text-[0.8rem] leading-none sm:text-[0.85rem]">{connectedUser.email}</span>
        </div>
      </section>
      <section className="flex-1 w-full min-h-0 overflow-y-auto px-2 sm:px-3" ref={chatAreaRef}>
        {isLoading && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>Loading messages...</strong></p>}
        {isError && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>Error: </strong>{error.message}</p>}
        {!isLoading && !isError && !Boolean(data?.length) && <p className="block border-2 border-dashed border-primary-black p-4 text-center my-4 mx-auto w-[92%] sm:w-[80%]"><strong>No messages yet!</strong></p>}
        {!isLoading && !isError && Boolean(data?.length) &&
          Object.keys(messages).map((date, index) => (
            <div key={date} className={index !== Object.keys(messages).length - 1 ? "pb-2 border-b border-primary-black" : ""}>
              <span className="bg-bisque border-2 border-[#101010]/75 p-2 rounded block my-4 mx-auto text-center w-fit min-w-[120px] sm:min-w-[150px]">{date}</span>
              {messages[date].map((msg) => (
                <div key={msg.id} className={`flex flex-col my-2 ${msg.sender.id === user.id ? "items-end" : "items-start"}`}>
                  <p className={`flex flex-col border-2 border-[#101010]/75 px-2 pt-2 pb-[2px] max-w-[85%] sm:max-w-[72%] lg:max-w-[45%] ${msg.sender.id === user.id ? "bg-green items-end rounded-[6px_0_6px_6px]" : "bg-beige items-start rounded-[0_6px_6px_6px]"}`}>
                    <span className="break-words min-w-0 w-full block text-[0.95rem]">{msg.content}</span>
                    <span className="mt-1 bg-primary-white text-[0.65rem] p-[2px] rounded-[3px] border border-primary-black/25 leading-none">{timeFormatter.format(new Date(msg.timestamp))}</span>
                  </p>
                </div>
              ))}
            </div>
        ))}
        {optimisticMessage && (
          <div className="flex flex-col my-2 items-end opacity-70">
            <p className="flex flex-col border-2 border-[#101010]/75 px-2 pt-2 pb-[2px] max-w-[85%] sm:max-w-[72%] lg:max-w-[45%] bg-green items-end rounded-[6px_0_6px_6px]">
              <span className="break-words min-w-0 w-full block text-[0.95rem]">{optimisticMessage}</span>
              <span className="mt-1 bg-primary-white text-[0.65rem] p-[2px] rounded-[3px] border border-primary-black/25 leading-none px-1">Sending...</span>
            </p>
          </div>
        )}
      </section>
      <section className="flex-shrink-0 w-full bg-secondary-white p-3 sm:p-4 flex items-end gap-2 sm:gap-3 border-t border-primary-black/25 rounded-b-[min(1rem,2vw)]">
        <div className="flex-1 bg-primary-white border-2 border-[#101010]/75 rounded-md focus-within:ring-[3px] focus-within:ring-[#101010]/75 transition-all duration-300 overflow-hidden">
          <textarea
            rows={1}
            value={inputText}
            placeholder="Type a message..."
            ref={messageRef}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="block px-4 py-[0.7rem] text-inherit bg-transparent outline-none border-none text-[0.95rem] placeholder:opacity-80 w-full resize-none min-h-[46px] max-h-[140px] leading-relaxed"
          />
        </div>
        <button onClick={handleSendMessage} disabled={isSending || !inputText.trim()} className={`mb-px flex-shrink-0 inline-flex h-[50px] w-[50px] items-center justify-center text-[1.5rem] rounded-md border-2 transition-all duration-200 sm:h-[51.6px] sm:w-[51.6px] ${inputText.trim() && !isSending ? "bg-primary-black border-primary-black text-primary-white hover:bg-secondary-black active:scale-[0.95] cursor-pointer" : "bg-primary-black/10 border-transparent text-primary-black/50 cursor-not-allowed"}`} >
          <i className="bx bx-up-arrow-alt"></i>
        </button>
      </section>
    </div>
  );
};

export default ChatPanel;
