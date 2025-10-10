import React, { useState } from "react";
import NavBar from "../components/NavBar";
import FormField from "../components/FormField";
import Footer from "../components/Footer";
import "./css_pages/SignUp.css";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import "../components/css/Modal.css";

export const SignUp = () => {
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
      <NavBar />
      <main className="signup-page-wrapper">
        <div className="signup">
          <div className="signup__overlay" />
          <div className="signup__container">
            <div className="signup__content">
              <section className="signup__left fade-in-up">
                <h1 className="hero-title">
                  Join the
                  <br />
                  <span className="highlighted-text">Student Affairs</span>
                  <br />
                  Digital Platform
                </h1>
              </section>

              <section className="signup__right fade-in-up">
                <h2 className="signup__header">Create Account</h2>
                <form className="signup__form" onSubmit={handleSubmit}>
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
                  <div className="signup__links">
                    Already have an account? <Link to="/login">Log in</Link>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>

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

        <Footer />
      </main>
    </>
  );
};
