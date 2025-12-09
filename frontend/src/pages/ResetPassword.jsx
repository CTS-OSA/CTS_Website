import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css_pages/resetpassword.css";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import "../components/css/Modal.css";
import { Eye, EyeOff } from "lucide-react";

export const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReNewPassword, setShowReNewPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    if (newPassword !== reNewPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setShowMessageModal(true);
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/auth/users/reset_password_confirm/",
        {
          uid,
          token,
          new_password: newPassword,
        }
      );

      setMessage("Password has been reset successfully.");
      setIsError(false);
      setShowMessageModal(true);
    } catch (err) {
      setMessage("Invalid link or password. Please try again.");
      setIsError(true);
      setShowMessageModal(true);
    } finally {
      setIsLoading(false);
    }
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
                Reset your Password
              </h1>

              <p className="max-w-md mx-auto lg:mx-0 text-sm sm:text-lg -mb-6 lg:mb-0">
                Create a strong password that you haven't used before.
              </p>
            </div>

            {/* FORM RIGHT SIDE */}
            <div className="fade-in-up w-full lg:w-1/2 px-4 sm:px-10 py-8 bg-white rounded-xl shadow-md">
              <h2 className="font-semibold text-lg sm:text-2xl text-center mb-4">
                Set a New Password
              </h2>

              <form onSubmit={handleSubmit} className="w-full">

                <div className="flex flex-col items-center w-full">

                  {/* New Password */}
                  <div className="relative w-full mb-4">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={`form-input ${isError ? "error" : ""} 
              w-full border border-gray-300 px-3 py-3 
              rounded-md focus:outline-none focus:ring-1 focus:ring-upmaroon`}
                    />
                    <button
                      type="button"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      onClick={() =>
                        newPassword && setShowNewPassword(!showNewPassword)
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${newPassword
                        ? "text-gray-600 hover:text-gray-800"
                        : "text-gray-300 cursor-not-allowed"
                        }`}
                      disabled={!newPassword}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative w-full mb-4">
                    <input
                      type={showReNewPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={reNewPassword}
                      onChange={(e) => setReNewPassword(e.target.value)}
                      required
                      className={`form-input ${isError ? "error" : ""} 
              w-full border border-gray-300 px-3 py-3 
              rounded-md focus:outline-none focus:ring-1 focus:ring-upmaroon`}
                    />
                    <button
                      type="button"
                      aria-label={showReNewPassword ? "Hide password" : "Show password"}
                      onClick={() =>
                        reNewPassword && setShowReNewPassword(!showReNewPassword)
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${reNewPassword
                        ? "text-gray-600 hover:text-gray-800"
                        : "text-gray-300 cursor-not-allowed"
                        }`}
                      disabled={!reNewPassword}
                    >
                      {showReNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Set New Password"}
                </button>
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
            <p className="loading-text">Resetting password... Please wait.</p>
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