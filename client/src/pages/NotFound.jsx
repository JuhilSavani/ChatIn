import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.replace("/");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center page py-8">
      <div className="w-[60%] p-[2rem_5rem] rounded-md bg-bisque border-2 border-[#101010]/75 border-b-[5px]">
        <h1 className="bg-primary-white w-[70%] text-xl border-b-[3px] border-dashed border-primary-black my-4">Page Not Found</h1>
        <p className="text-md">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <span className="block mt-3 font-semibold text-md">You can try the following:</span>
        <ul className="text-sm ml-4">
          <li>- Check the URL for errors.</li>
          <li>- Go back to the previous page.</li>
        </ul>
        <Link to="/" onClick={handleClick} className="inline-block mt-4 mb-2 rounded-md text-md py-3 px-6 text-primary-black bg-green border-2 border-[#101010]/75 transition-all duration-300 hover:ring-2 hover:ring-[#101010]/75">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
