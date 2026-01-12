import React, { useState, useEffect } from "react";
import { useApiRequest } from "../context/ApiRequestContext";
import { useAuth } from "../context/AuthContext";
import "./css_pages/resetpassword.css";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import "../components/css/Modal.css";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "react-feather";

export const ChangePassword = () => {
  const { request } = useApiRequest();
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showReNewPassword, setShowReNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleModalOk() {
      setShowModal(false);
      if (!isError) {
        logout(navigate);
      }
    }

    window.addEventListener("modal-ok", handleModalOk);
    return () => window.removeEventListener("modal-ok", handleModalOk);
  }, [isError, logout, navigate]);

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
        "/auth/users/set_password/",
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

      setMessage("Password changed successfully. You will be logged out.");
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

  return (
    <>
      <h1 className="page-heading">SYSTEM SETTINGS</h1>
      <div className="reset-password-page-wrapper">
        <div className="reset-password">
          <h2 className="form-title">CHANGE PASSWORD</h2>
          <form onSubmit={handleSubmit} className="-mt-4">
            <div className="relative">
              <FormField
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                name="currentPassword"
              />

              <button
                type="button"
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
                disabled={!currentPassword}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  currentPassword
                    ? "text-gray-500 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() =>
                  currentPassword &&
                  setShowCurrentPassword(!showCurrentPassword)
                }
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <FormField
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                name="newPassword"
              />

              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                disabled={!newPassword}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  newPassword
                    ? "text-gray-500 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() =>
                  newPassword && setShowNewPassword(!showNewPassword)
                }
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <FormField
                label="Confirm New Password"
                type={showReNewPassword ? "text" : "password"}
                value={reNewPassword}
                onChange={(e) => setReNewPassword(e.target.value)}
                required
                name="reNewPassword"
              />

              <button
                type="button"
                aria-label={
                  showReNewPassword ? "Hide password" : "Show password"
                }
                disabled={!reNewPassword}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  reNewPassword
                    ? "text-gray-500 cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() =>
                  reNewPassword && setShowReNewPassword(!showReNewPassword)
                }
              >
                {showReNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="bg-upmaroon mt-2 rounded-md text-white font-roboto p-2 w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "PROCESSING..." : "CONFIRM"}
            </button>
          </form>
        </div>
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <Modal type="loading" noHeader>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text">
              Currently in progress... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {/* Success/Error Modal */}
      {showModal && !isLoading && (
        <Modal type={isError ? "error" : "success"}>
          <p className="text-lg font-semibold">
            {message}
          </p>
        </Modal>
      )}
    </>
  );
};