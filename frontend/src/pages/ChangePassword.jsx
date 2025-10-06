import React, { useState } from "react";
import { useApiRequest } from "../context/ApiRequestContext";
import { useAuth } from "../context/AuthContext";
import "./css_pages/resetpassword.css";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import "../components/css/Modal.css";
import { useNavigate } from "react-router-dom";

export const ChangePassword = () => {
  const { request } = useApiRequest();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);
    setMessage("");
    setError("");
    setIsLoading(true);

    if (newPassword !== reNewPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setIsLoading(false);
      setShowModal(true);
      return;
    }

    try {
      const res = await request(
        "http://localhost:8000/auth/users/set_password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            re_new_password: reNewPassword,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        const firstError =
          Object.values(errData)[0]?.[0] || "Password change failed.";
        setMessage(firstError);
        setIsError(true);
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      setMessage("Password changed successfully.");
      setIsError(false);
      setIsLoading(false);
      setShowModal(true);
      setCurrentPassword("");
      setNewPassword("");
      setReNewPassword("");
    } catch (err) {
      setMessage("An unexpected error occurred.");
      setIsError(true);
      setIsLoading(false);
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (!isError) {
      logout(navigate);
    }
  };

  return (
    <>
      <h1 className="page-heading">PRIVACY SETTING</h1>
      <div className="reset-password-page-wrapper">
        <div className="reset-password">
          <h2 className="form-title">CHANGE PASSWORD</h2>
          <form onSubmit={handleSubmit} className="reset_form">
            <FormField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required={true}
              name="currentPassword"
            />

            <FormField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required={true}
              name="newPassword"
            />

            <FormField
              label="Confirm New Password"
              type="password"
              value={reNewPassword}
              onChange={(e) => setReNewPassword(e.target.value)}
              required={true}
              name="reNewPassword"
            />
            <button type="submit" className="submit-button">
              CONFIRM
            </button>
          </form>
        </div>
      </div>

      {isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text">
              Currently in progress... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {/* Modal for success or error */}
      {showModal && !isLoading && (
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
    </>
  );
};
