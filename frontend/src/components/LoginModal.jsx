import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { AuthContext } from "../context/AuthContext";
import Modal from "../components/Modal";
import { X, Eye, EyeOff } from "react-feather";

export default function LoginModal({ onClose, onSwitchToSignup }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    function handleOk() {
      setShowMessageModal(false);
      if (!isError) {
        onClose();
        navigate("/student");
      }
    }
    window.addEventListener("modal-ok", handleOk);
    return () => window.removeEventListener("modal-ok", handleOk);
  }, [isError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const success = await login(email, password, "student");

      if (success) {
        setIsError(false);
        setMessage(`Welcome back! ${email}`);
        setShowMessageModal(true);
      } else {
        setIsError(true);
        setMessage("Invalid email or password. Please try again.");
        setShowMessageModal(true);
        setPassword("");
      }
    } catch {
      setIsError(true);
      setMessage("An error occurred. Please try again later.");
      setShowMessageModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" />

      {/* Modal Wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[600px] bg-white/90 backdrop-blur-md text-gray-900 
          rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] 
          border border-white/40 animate-scaleIn">

          <section className="p-8 md:p-12 relative flex flex-col justify-center items-center max-h-[85vh] overflow-y-auto rounded-2xl">

            {/* Close Button */}
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition transform hover:scale-110"
              onClick={onClose}
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#7B1113] text-center mt-4 tracking-wide">
              Welcome to OSA - CTS
            </h2>

            <p className="text-gray-600 text-sm mt-1 text-center">
              Log in to your account
            </p>

            <form
              className="w-full max-w-[460px] mt-10 space-y-5"
              onSubmit={handleSubmit}
            >
              <FormField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                required
              />

              <div className="relative">
                <FormField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={!password}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                    password
                      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => password && setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <SubmitButton text={loading ? "Logging in..." : "Log In"} disabled={loading} />

              <div className="text-xs text-gray-600 -mt-1 mb-3 underline text-center">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <hr className="opacity-40" />

              <div className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-[#7B1113] underline cursor-pointer font-medium"
                >
                  Sign up
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Loading Modal */}
      {loading && (
        <Modal type="loading" noHeader>
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7B1113] rounded-full animate-spin" />
            <p className="text-[#7B1113] font-semibold tracking-wide">
              Logging in... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {/* Success/Error Modal */}
      {showMessageModal && !loading && (
        <Modal type={isError ? "error" : "success"}>
          <p className="text-lg font-semibold">
            {message}
          </p>
        </Modal>
      )}
    </>
  );
}
