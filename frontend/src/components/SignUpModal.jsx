import React, { useState } from "react";
import FormField from "./FormField";
import "../pages/css_pages/SignUp.css";
import Modal from "./Modal";
import "./css/Modal.css";
import { X, Eye, EyeOff } from "react-feather";

export default function SignUpModal({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [rePassword, setRePassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
    rePassword: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setShowMessageModal(false);
    setIsLoading(true);

    const errors = {};
    let hasError = false;

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/;

    if (!email) {
      errors.email = true;
      hasError = true;
    } else if (!gmailRegex.test(email)) {
      setMessage("Invalid email. Please use your UP Mail and try again. ");
      setIsError(true);
      setIsLoading(false);
      setShowMessageModal(true);
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
      setFormErrors({
        email: !email,
        password: !password,
        rePassword: !rePassword,
      });
      setIsLoading(false);
      return;
    }

    if (password !== rePassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setIsLoading(false);
      setShowMessageModal(true);
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
        headers: {
          "Content-Type": "application/json",
        },
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
            errorMessages =
              "Password is too short and common. It must contain at least 8 characters.";
          } else if (isTooShort) {
            errorMessages =
              "Password is too short. It must contain at least 8 characters.";
          } else if (isTooCommon) {
            errorMessages =
              "Password is too common. Please choose a more secure one.";
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
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      setIsError(true);
      setShowMessageModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40"></div>
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-[620px] sm:max-w-[720px] bg-white text-gray-900 rounded-3xl shadow-lg fade-in-up">
          <section className="bg-white p-6 sm:p-10 md:p-12 relative flex flex-col justify-center items-center overflow-y-auto rounded-2xl max-h-[85vh]">
            <button
              className="absolute right-0 top-0 m-5 cursor-pointer"
              onClick={onClose}
            >
              <X />
            </button>

            <h2 className="font-sans text-xl font-bold text-[#7B1113] text-center mt-5">
              Create Account
            </h2>
            {/* FORM AREA */}
            <form
              className="p-0 bg-transparent shadow-none w-full max-w-[470px] mt-10"
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <FormField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  required
                  error={formErrors.email}
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
                  error={formErrors.password}
                  className="pr-10"
                />

                {/* Eye icon */}
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={!password}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    password ? "text-gray-500 cursor-pointer" : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => password && setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mb-3 relative">
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

                {/* Eye icon */}
                <button
                  type="button"
                  aria-label={
                    showRePassword ? "Hide confirm password" : "Show confirm password"
                  }
                  disabled={!rePassword}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    rePassword ? "text-gray-500 cursor-pointer" : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => rePassword && setShowRePassword(!showRePassword)}
                >
                  {showRePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button type="submit" className="submit-button">
                Sign Up
              </button>
              <div className="text-center text-sm text-gray-600 mt-2 leading-[1.6]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-red-900 underline bg-transparent border-none cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
      {isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <div className="loading-spinner" />
            <p className="loading-text text-upmaroon">
              Signing up... Please wait.
            </p>
          </div>
        </Modal>
      )}

      {showMessageModal && !isLoading && (
        <Modal>
          <div className="modal-message-with-spinner">
            <p
              className="loading-text text-upmaroon"
              style={{ fontWeight: "bold" }}
            >
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
