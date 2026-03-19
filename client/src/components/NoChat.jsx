import React from "react";

const NoChat = () => {
  return (
    <div className="text-center flex flex-col gap-4">
      <span>
        <i className="bx bxs-message-alt-dots text-xl"></i>
      </span>
      <h1 className="text-xl">Welcome to ChatIn'</h1>
      <p className="font-medium">Select any conversation from the sidebar to start chatting.</p>
    </div>
  );
};

export default NoChat;
