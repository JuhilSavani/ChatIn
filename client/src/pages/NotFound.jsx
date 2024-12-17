import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.replace("/");
  };

  return (
    <div className="page not-found">
      <div className="container">
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <span>You can try the following:</span>
        <ul>
          <li>- Check the URL for errors.</li>
          <li>- Go back to the previous page.</li>
        </ul>
        <Link to="/" onClick={handleClick}>
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
