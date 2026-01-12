import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "react-feather";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import "./css_pages/verifiedPage.css";

export const VerifiedPage = () => {
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [icon, setIcon] = useState(
    <CheckCircle className="check-icon" size={80} />
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          "/auth/users/activation/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, token }),
          }
        );

        if (response.ok) {
          setMessage("Your email has been verified! You can now log in.");
          setIcon(<CheckCircle className="check-icon" size={80} />);
        } else {
          const errorData = await response.json();
          const errorMsg =
            errorData?.detail ||
            "Verification failed. The link may be invalid or expired.";
          setMessage(errorMsg);
          setIcon(<AlertCircle className="alert-icon" size={80} />);
        }
      } catch (error) {
        setMessage("An error occurred during verification.");
        setIcon(<AlertCircle className="alert-icon" size={80} />);
      } finally {
        setLoading(false);
      }
    };
    if (uid && token && !calledRef.current) {
      calledRef.current = true;
      verifyEmail();
    }
  }, [uid, token]);

const WaitingModal = () => (
  <div className="modal-overlay">
    <div className="modal-content modal-message-with-spinner">
      <div className="loading-spinner" />
      <p className="loading-text">Waiting for authentication...</p>
    </div>
  </div>
);

  return (
    <div>
      <Navbar />
      <div className="verified-page">
        <div className="content-container">
          {loading ? (
            <WaitingModal />

          ) : (
            <>
              {icon}
              <h2>{message}</h2>
              {message.includes("verified") && (
                <button
                  onClick={() => navigate("/")}
                  className="continue-button"
                >
                  Continue to Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};