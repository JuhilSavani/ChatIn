import React from "react";

const NoChat = () => {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center sm:gap-4 sm:px-6">
      <span>
        <i className="bx bxs-message-alt-dots text-[2rem] sm:text-xl"></i>
      </span>
      <h1 className="text-[2rem] sm:text-xl">Welcome to ChatIn'</h1>
      <p className="max-w-[32rem] text-[1rem] font-medium sm:text-sm">
        Select any conversation from the sidebar to start chatting.
      </p>
    </div>
  );
};

export default NoChat;
