import React, { useState } from "react";
import FormField from "./FormField";
import "../pages/css_pages/SignUp.css";
import { Link } from "react-router-dom";
import Modal from "./Modal";
import "./css/Modal.css";
import { X } from "react-feather";


export default function SignUpModal ({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <div className="fixed top-20 left-1/2 right-1/2 w-2/5 h-3/5 transform -translate-x-1/2 
          bg-white text-gray-900 rounded-3xl shadow-lg z-50 fade-in-up">
            <section className="bg-[#EDEDED] p-16 relative flex flex-col justify-center items-center overflow-y-auto rounded-2xl">
                <button className="absolute right-0 top-0 m-5 cursor-pointer" onClick={onClose}>
                    <X />
                </button>
                <h2 className="font-sans text-xl font-bold text-[#7B1113] text-center">Create Account</h2>
                <form className="p-0 bg-transparent shadow-none w-full max-w-[470px] mt-5" onSubmit={handleSubmit}>
                    <FormField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        required
                        error={formErrors.email}
                    />
                <FormField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        name="password"
                        required
                        error={formErrors.password}
                    />
                <FormField
                        label="Confirm Password"
                        type="password"
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                        name="rePassword"
                        required
                        error={formErrors.rePassword}
                    />
                <button type="submit" className="submit-button">
                    Sign Up
                </button>
                <div className="text-center text-sm text-gray-600 mt-2 leading-[1.6]">
                    Already have an account? <button type="button" onClick={onSwitchToLogin} className="text-red-900 underline bg-transparent border-none cursor-pointer">Log in</button>
                </div>
                </form>
            </section>

            {isLoading && (
            <Modal>
                <div className="modal-message-with-spinner">
                <div className="loading-spinner" />
                <p className="loading-text">Signing up... Please wait.</p>
                </div>
            </Modal>
            )}

            {showMessageModal && !isLoading && (
            <Modal>
                <div className="modal-message-with-spinner">
                <p className="loading-text" style={{ fontWeight: "bold" }}>
                    {isError ? "Error" : "Success"}
                </p>
                <p>{message}</p>
                <button
                    className="okay-button"
                    onClick={() => setShowMessageModal(false)}
                >
                    OK
                </button>
                </div>
            </Modal>
            )}
        </div>
  </>
  );
};
