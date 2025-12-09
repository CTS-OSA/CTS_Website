import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";
import { AuthContext } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./css_pages/loginPage.css";
import Modal from "../components/Modal";
import { Eye, EyeOff } from "react-feather";
import NotFound from "./NotFound";

const LoginPage = () => {
  const { login, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const role = new URLSearchParams(location.search).get("role");

  if (role !== "admin") {
    return <NotFound />;
  }

  useEffect(() => {
    function handleModalOk() {
      setShowMessageModal(false);
      if (!isError) {
        navigate(role === "admin" ? "/admin" : "");
      }
    }

    window.addEventListener("modal-ok", handleModalOk);
    return () => window.removeEventListener("modal-ok", handleModalOk);
  }, [isError, role, navigate]);

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
      } else {
        setShowMessageModal(true);
        setMessage("Invalid email or password. Please try again.");
        setIsError(true);
        setPassword("");
      }
    } catch {
      setError("An error occurred. Please try again later.");
      setShowMessageModal(true);
      setMessage("An error occurred. Please try again later.");
      setIsError(true);
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
                  <div className="mt-3">
                    <FormField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      name="email"
                      required
                    />
                  </div>

                  <div className="mt-3 relative">
                    <FormField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      required
                    />

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

                  <div className="mt-3" />
                  <SubmitButton text={loading ? "Logging in..." : "Log In"} disabled={loading} />
                </form>
              </section>
            </div>
          </div>
        </div>

        {/* Loading Modal */}
        {loading && (
          <Modal type="loading" noHeader>
            <div className="modal-message-with-spinner">
              <div className="loading-spinner" />
              <p className="loading-text">Logging in... Please wait.</p>
            </div>
          </Modal>
        )}

        {/* SUCCESS / ERROR MODAL */}
        {showMessageModal && !loading && (
          <Modal type={isError ? "error" : "success"}>
            <p className="text-lg font-semibold">
              {message}
            </p>
          </Modal>
        )}

        <Footer />
      </main>
    </>
  );
};

export default LoginPage;