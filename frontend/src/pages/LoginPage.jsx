import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { AuthContext } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./css_pages/loginPage.css";
import Modal from "../components/Modal";

const LoginPage = () => {
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
          navigate(role === "admin" ? "/admin" : "");
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
      <NavBar />
      <main className="login-page-wrapper">
        <div className="login">
          <div className="login__overlay" />
          <div className="login__container">
            <div className="login__content">
              <section className="login__left fade-in-up">
                <h1 className="hero-title">
                  Welcome to the
                  <br />
                  <span className="highlighted-text">
                    Office of Student Affairs
                  </span>
                  <br />
                  Digital Platform
                </h1>
              </section>

              <section className="login__right fade-in-up">
                <h2 className="login__header">Login as Admin</h2>
                <form className="login__form" onSubmit={handleSubmit}>
                  <FormField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    required
                  />
                  <FormField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    required
                  />
                  <SubmitButton
                    text={loading ? "Logging in..." : "Log In"}
                    disabled={loading}
                  />
                  <div className="login__links">
                    <Link to="/forgot-password">Forgot password?</Link>
                    <br />
                    {/* Conditionally render Sign Up link based on role */}
                    {role !== "admin" && (
                      <span>
                        Don’t have an account? <Link to="/signup">Sign Up</Link>
                      </span>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>

        {loading && (
          <Modal>
            <div className="modal-message-with-spinner">
              <div className="loading-spinner" />
              <p className="loading-text">Logging in... Please wait.</p>
            </div>
          </Modal>
        )}

        {showMessageModal && !loading && (
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

export default LoginPage;
