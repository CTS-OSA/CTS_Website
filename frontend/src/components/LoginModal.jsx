import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { AuthContext } from "../context/AuthContext";
import "../pages/css_pages/loginPage.css";
import Modal from "../components/Modal";
import { X, Eye, EyeOff } from "react-feather";

export default function LoginModal({ onClose, onSwitchToSignup }) {
  const { login, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setShowMessageModal(false);
    setLoading(true);
    setError(null);

    try {
      const success = await login(email, password, "student");
      if (success) {
        setShowMessageModal(true);
        setMessage(`Welcome back! ${email}`);
        setIsError(false);
        setLoading(false);
        setTimeout(() => {
          navigate("/student");
        }, 500);
      } else {
        setShowMessageModal(true);
        setMessage("Invalid email or password. Please try again.");
        setIsError(true);
        setLoading(false);
        setPassword("");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[620px] sm:max-w-[700px] bg-white text-gray-900 rounded-3xl shadow-lg fade-in-up">
          <section className="bg-white p-6 sm:p-10 md:p-12 relative flex flex-col justify-center items-center overflow-y-auto rounded-2xl max-h-[85vh]">
            <button
              className="absolute right-0 top-0 m-5 cursor-pointer"
              onClick={onClose}
            >
              <X />
            </button>
            <h2 className="font-sans text-xl font-bold text-[#7B1113] text-center mt-5">
              Log in to your account
            </h2>
            <form
              className="p-0 bg-transparent shadow-none w-full max-w-[460px] mt-10"
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <FormField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  required
                />
              </div>
              <div className="mb-3 relative">
                <FormField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  required
                  className="pr-10"
                />

                {/* Eye icon */}
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={!password}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    password
                      ? "text-gray-500 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => password && setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <SubmitButton
                text={loading ? "Logging in..." : "Log In"}
                disabled={loading}
              />
              <div className="text-xs text-gray-600 -mt-1 mb-3 underline text-center">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <hr className="opacity-30" />
              <div className="text-center text-sm text-gray-600 mt-2 leading-[1.6]">
                <br />
                <span className="text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-red-900 underline bg-transparent border-none cursor-pointer"
                  >
                    Sign up
                  </button>
                </span>
              </div>
            </form>
          </section>
        </div>
      </div>
      {loading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text text-upmaroon">
              Logging in... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {showMessageModal && !loading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <p className="loading-text text-upmaroon font-bold">
              {isError ? "Error" : "Success"}
            </p>
            <p className="text-[#333]">{message}</p>
            <button
              className="okay-button"
              onClick={() => {
                setShowMessageModal(false);
                if (!isError) {
                  onClose();
                }
              }}
            >
              OK
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
