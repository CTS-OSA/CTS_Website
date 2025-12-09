import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import Modal from "./Modal";
import { X, Eye, EyeOff } from "react-feather";

export default function SignUpModal({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
    rePassword: false,
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    function handleOk() {
      setShowMessageModal(false);
      if (!isError) onClose();
    }
    window.addEventListener("modal-ok", handleOk);
    return () => window.removeEventListener("modal-ok", handleOk);
  }, [isError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;

    const errors = {};
    let hasError = false;

    if (!email) {
      errors.email = true;
      hasError = true;
    } else if (!gmailRegex.test(email)) {
      setMessage("Invalid email. Please use your UP Mail and try again.");
      setIsError(true);
      setShowMessageModal(true);
      setIsLoading(false);
      return;
    }

    if (!password) {
      errors.password = true;
      hasError = true;
    }

    if (!rePassword) {
      errors.rePassword = true;
      hasError = true;
    }

    if (hasError) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    if (password !== rePassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setShowMessageModal(true);
      setIsLoading(false);
      return;
    }

    const userData = {
      email,
      password,
      re_password: rePassword,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful! Please check your email.");
        setIsError(false);
        setShowMessageModal(true);
      } else {
        let errorMessages = "";

        if (data.email && Array.isArray(data.email)) {
          if (data.email.some((msg) => msg.toLowerCase().includes("already"))) {
            errorMessages = "This email is already registered.";
          } else {
            errorMessages = data.email.join(" ");
          }
        } else if (data.password && Array.isArray(data.password)) {
          const passwordErrors = data.password;
          const isTooShort = passwordErrors.some((msg) =>
            msg.toLowerCase().includes("too short")
          );
          const isTooCommon = passwordErrors.some((msg) =>
            msg.toLowerCase().includes("too common")
          );

          if (isTooShort && isTooCommon) {
            errorMessages = "Password is too short and common.";
          } else if (isTooShort) {
            errorMessages = "Password is too short.";
          } else if (isTooCommon) {
            errorMessages = "Password is too common.";
          } else {
            errorMessages = passwordErrors.join(" ");
          }
        } else {
          errorMessages = Object.entries(data)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join(" ");
        }

        setMessage(errorMessages || "Something went wrong.");
        setIsError(true);
        setShowMessageModal(true);
      }
    } catch (err) {
      setMessage("An error occurred. Please try again later.");
      setIsError(true);
      setShowMessageModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Background Fade */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" />

      {/* Wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div
          className="
            w-full max-w-[620px] sm:max-w-[720px]
            bg-white/90 backdrop-blur-md text-gray-900
            rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]
            border border-white/40 animate-scaleIn
          "
        >
          <section className="p-6 sm:p-10 md:p-12 relative flex flex-col items-center overflow-y-auto rounded-2xl max-h-[85vh]">

            {/* Close button */}
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transform hover:scale-110 transition"
              onClick={onClose}
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#7B1113] text-center mt-4 tracking-wide">
              Create Account
            </h2>

            <form
              className="w-full max-w-[470px] mt-10 space-y-5"
              onSubmit={handleSubmit}
            >
              {/* Email */}
              <FormField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                required
                error={formErrors.email}
              />

              {/* Password */}
              <div className="relative">
                <FormField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  required
                  error={formErrors.password}
                  className="pr-10"
                />

                <button
                  type="button"
                  disabled={!password}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    password
                      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => password && setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FormField
                  label="Confirm Password"
                  type={showRePassword ? "text" : "password"}
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  name="rePassword"
                  required
                  error={formErrors.rePassword}
                  className="pr-10"
                />

                <button
                  type="button"
                  disabled={!rePassword}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    rePassword
                      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() =>
                    rePassword && setShowRePassword(!showRePassword)
                  }
                >
                  {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-4 py-3 bg-[#7B1113] text-white rounded-xl shadow-md hover:bg-[#5e0d0f] transition font-semibold tracking-wide"
              >
                Sign Up
              </button>

              {/* Switch to Login */}
              <div className="text-center text-sm text-gray-600 mt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#7B1113] underline font-medium"
                  onClick={onSwitchToLogin}
                >
                  Log in
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <Modal type="loading">
          <div className="flex flex-col items-center gap-4 p-6">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#7B1113] rounded-full animate-spin" />
            <p className="text-[#7B1113] font-semibold tracking-wide">
              Signing up... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {/* Success / Error Modal */}
      {showMessageModal && !isLoading && (
        <Modal type={isError ? "error" : "success"}>
          <p className="text-lg font-semibold">{message}</p>
        </Modal>
      )}
    </>
  );
}
