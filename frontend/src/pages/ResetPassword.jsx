import React, { useState } from "react";
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

  const handleModalClose = () => {
    setShowMessageModal(false);
    if (!isError) navigate("/login");
  };

  return (
    <div className="signup-page-wrapper">
      <Navbar />
      <div className="signup">
        <div className="signup__container">
          <div className="signup__content fade-in-up">
            <div className="signup__left fade-in-up">
              <h1 className="hero-title">
                Reset your <span className="highlighted-text">Password</span>
              </h1>
            </div>

            <div className="signup__right fade-in-up">
              <h2 className="signup__header">Set a New Password</h2>

              <form onSubmit={handleSubmit} className="signup__form">
                {/* New Password */}
                <div className="relative w-full mb-4">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border border-gray-400 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-upmaroon transition"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      newPassword && setShowNewPassword(!showNewPassword)
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      newPassword
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
                    className="w-full border border-gray-400 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-upmaroon transition"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      reNewPassword && setShowReNewPassword(!showReNewPassword)
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      reNewPassword
                        ? "text-gray-600 hover:text-gray-800"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!reNewPassword}
                  >
                    {showReNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <button type="submit" className="submit-button">
                  Set New Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text">Resetting password... Please wait.</p>
          </div>
        </Modal>
      )}

      {/* Message Modal */}
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
    </div>
  );
};
