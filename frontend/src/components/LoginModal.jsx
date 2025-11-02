import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { AuthContext } from "../context/AuthContext";
import "../pages/css_pages/loginPage.css";
import Modal from "../components/Modal";
import { X } from "react-feather";

export default function LoginModal ({ onClose, onSwitchToSignup}) {
  const { login, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const role = new URLSearchParams(location.search).get("role");
  const roleLabel = role === "admin" ? "Admin" : "Student";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setShowMessageModal(false);
    setLoading(true);
    setError(null);

    try {
      const success = await login(email, password, role);
      if (success) {
        setShowMessageModal(true);
        setMessage(`Welcome back! ${email}`);
        setIsError(false);
        setLoading(false);
        setTimeout(() => {
          navigate(role === "admin" ? "/admin" : "/student");
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
        <div className="fixed top-20 left-1/2 right-1/2 w-4/5 h-3/5 transform -translate-x-1/2 
          bg-white text-gray-900 rounded-3xl shadow-lg z-50 fade-in-up
          sm:w-[80%] sm:h-1/9 md:w-[65%] lg:w-[45%]
          ">
          <section 
            className="bg-white p-10 sm:p-12 md:p-14 relative flex flex-col justify-center items-center overflow-y-auto rounded-2xl
            
            ">
            <button className="absolute right-0 top-0 m-5 cursor-pointer" onClick={onClose}>
              <X />
            </button>
            <h2 className="font-sans text-xl font-bold text-[#7B1113] text-center mt-5">Log in to your account</h2>
            <form className="p-0 bg-transparent shadow-none w-full max-w-[460px] mt-10" onSubmit={handleSubmit}>
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
                <div className="mb-3">
                  <FormField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    required
                  />
                </div>
              <div className="text-xs text-gray-600 -mt-3 mb-3 underline">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
                <SubmitButton
                  text={loading ? "Logging in..." : "Log In"}
                  disabled={loading}
                />
              <div className="flex items-center justify-center mb-4">
                <hr className="grow border-t border-gray-300" />
                <span className="mx-3 text-gray-500 text-sm">or</span>
                <hr className="grow border-t border-gray-300" />
              </div>
              <SubmitButton
                text={loading ? "Logging in..." : "Log in with Google"}
                disabled={loading}
              />
              <div className="text-center text-sm text-gray-600 mt-2 leading-[1.6]">
                <br />
                {/* Conditionally render Sign Up link based on role */}
                {role !== "admin" && (
                  <span className="text-sm text-gray-600">
                    Don’t have an account? <button type="button" onClick={onSwitchToSignup} className="text-red-900 underline bg-transparent border-none cursor-pointer">Sign up</button>
                  </span>
                )}
              </div>
            </form>
          </section>
        </div>
        {loading && (
          <Modal>
            <div className="modal-message-with-spinner">
              <div className="loading-spinner" />
              <p className="loading-text text-upmaroon">Logging in... Please wait.</p>
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
};

