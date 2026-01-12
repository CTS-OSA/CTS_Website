import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    function handleModalOk() {
      setShowMessageModal(false);
      if (!isError) {
        navigate("/");
      }
    }

    window.addEventListener("modal-ok", handleModalOk);
    return () => window.removeEventListener("modal-ok", handleModalOk);
  }, [isError, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setShowMessageModal(false);
    setIsLoading(true);

    try {
      await axios.post("/auth/users/reset_password/", {
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

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 h-150 lg:h-100 flex flex-col">
        <div className="px-4 lg:px-10 py-10 flex-1 flex items-center justify-center">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl">

            {/* TEXT LEFT SIDE */}
            <div className="fade-in-up text-center lg:text-left w-full lg:w-1/2 space-y-4 px-2">
              <h1 className="font-bold text-upmaroon text-3xl sm:text-4xl lg:text-5xl -mt-6">
                Forgot your Password?
              </h1>

              <p className="max-w-md mx-auto lg:mx-0 text-sm sm:text-lg md:text-xl">
                Enter the email linked to your account and we'll send a secure reset link right away.
              </p>
            </div>

            {/* FORM RIGHT SIDE */}
            <div className="fade-in-up w-full lg:w-1/2 px-4 sm:px-10 py-8 bg-white rounded-xl shadow-md">
              <h2 className="font-semibold text-lg sm:text-2xl text-center mb-4">
                Reset Your Password
              </h2>

              <form onSubmit={handleSubmit} className=" w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="yourname@up.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`form-input ${isError ? "error" : ""} 
              w-full border border-gray-300 px-3 py-3 
              rounded-md focus:outline-none focus:ring-1 focus:ring-upmaroon`}
                />

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="submit"
                    className="bg-red-800 text-white font-medium w-full sm:w-1/2 rounded-md py-3 hover:bg-upmaroon transition duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    className="bg-gray-300 text-black font-medium w-full sm:w-1/2 rounded-md py-3 hover:bg-gray-400 transition duration-300"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <Modal type="loading" noHeader>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text">Sending reset link... Please wait.</p>
          </div>
        </Modal>
      )}

      {/* Success/Error Modal */}
      {showMessageModal && !isLoading && (
        <Modal type={isError ? "error" : "success"}>
          <p className="text-lg font-semibold">
            {message}
          </p>
        </Modal>
      )}

      <Footer />
    </>
  );
};