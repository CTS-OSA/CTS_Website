import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import "./css_pages/forgotpassword.css";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import "../components/css/Modal.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setShowMessageModal(false);
    setIsLoading(true);

    try {
      await axios.post("http://localhost:8000/auth/users/reset_password/", {
        email,
      });
      setMessage("Password reset email sent. Check your inbox.");
      setIsError(false);
      setShowMessageModal(true);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
      setIsError(true);
      setShowMessageModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowMessageModal(false);
    if (!isError) {
      navigate("/login");
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="signup">
        <div className="signup__container">
          <div className="signup__content fade-in-up">
            <div className="signup__left fade-in-up">
              <h1 className="hero-title">
                Forgot your <span className="highlighted-text">Password?</span>
              </h1>
            </div>
            <div className="signup__right fade-in-up">
              <h2 className="signup__header">Reset Your Password</h2>
              <form onSubmit={handleSubmit} className="signup__form">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`form-input ${
                    isError ? "error" : ""
                  } w-full border-1 border-gray-400 px-3 py-2 rounded-md focus:outline-none focus:ring-1/2 focus:ring-upmaroon`}
                />
                <div className="button-group" style={{ marginTop: "20px" }}>
                  <button
                    type="submit"
                    className="bg-red-800 text-white font-md hover:font-semibold w-1/2 rounded-md hover:bg-upmaroon transition duration-300"
                    style={{ marginBottom: "0" }}
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    className="bg-[#c3c3c3] text-black font-md hover:font-semibold w-1/2 rounded-md hover:bg-[#8b8b8b] transition duration-300"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text">Sending reset link... Please wait.</p>
          </div>
        </Modal>
      )}

      {showMessageModal && !isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <p className="loading-text" style={{ fontWeight: "bold" }}>
              {isError ? "Error" : "Success"}
            </p>
            <p>{message}</p>
            <button className="okay-button" onClick={handleModalClose}>
              OK
            </button>
          </div>
        </Modal>
      )}

      <Footer />
    </>
  );
};
