import React from "react";
import { AlertCircle } from "react-feather";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="verified-page">
      <div className="content-container">

        <AlertCircle className="alert-icon" size={90} />

        <h2>404: Page Not Found</h2>

        <p>Sorry, the page you're looking for doesn't exist.</p>

        <Link to="/" className="continue-button">
          Return Home
        </Link>

      </div>
    </div>
  );
};

export default NotFound;
