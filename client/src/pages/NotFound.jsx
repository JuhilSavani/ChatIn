import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.replace("/");
  };

  return (
    <div className="page flex min-h-full w-full items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-3xl rounded-md bg-bisque border-2 border-[#101010]/75 border-b-[5px] px-6 py-8 sm:px-10">
        <h1 className="my-4 w-full bg-primary-white border-b-[3px] border-dashed border-primary-black text-[2rem] sm:w-[70%] sm:text-xl">Page Not Found</h1>
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
