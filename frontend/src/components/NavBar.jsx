import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/upmin-logo.svg";
import { Menu, X, ChevronDown, Home, User } from "react-feather";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function Navbar() {
  const { user, logout, isAuthenticated, role, profileData, loading, login, authError } =
    useContext(AuthContext);
  const [activeModal, setActiveModal] = useState(null); // 'login' or 'signup'
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const navigate = useNavigate();
  const loginRef = useRef(null);
  const userRef = useRef(null);

  const nickname = profileData?.nickname ?? user?.nickname ?? "User";
  const fullName = `${profileData?.first_name || user?.first_name || ""} ${
    profileData?.last_name || user?.last_name || ""
  }`.trim();
  const idNumber = profileData?.student_id || user?.student_id || "";

  useEffect(() => {
    const handler = (e) => {
      // Close the modal if overlay is clicked
      if (activeModal && e.target.classList.contains('bg-black/50')) {
        setActiveModal(null);
      }
      if (userRef.current && !userRef.current.contains(e.target))
        setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeModal]);

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
    setActiveModal(null);
  };

  const handleRoleLogin = (r) => {
    navigate(`/login?role=${r}`);
    setActiveModal(null);
    setMobileOpen(false);
  };

  const openLogoutConfirm = () => {
    setConfirmLogoutOpen(true);
    setMobileOpen(false);
    setShowUserDropdown(false);
  };

  const confirmLogout = () => {
    logout(navigate);
    setConfirmLogoutOpen(false);
  };

  if (loading) {
    return (
      <nav className="sticky top-0 left-0 w-full bg-upmaroon z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center p-4">
          <img src={logo} alt="logo" className="h-12 w-auto mr-4" />
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }
  
  return (
    <>
      <nav className="sticky top-0 left-0 w-full bg-upmaroon text-white z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          {/* Logo + title wrapper: centers on small, left-align on md+ */}
          <Link
            to="/"
            className="flex-1 flex items-center gap-4 no-underline justify-center md:justify-start"
          >
            <img
              src={logo}
              alt="UP Mindanao logo"
              className="h-12 w-12 object-contain"
            />
            <div className="leading-tight select-none font-tnr max-w-[300px] text-center md:text-left">
              <div className="text-sm md:text-base font-bold ">
                University of the Philippines Mindanao
              </div>
              <div className="text-sm md:text-base font-semibold truncate">
                Office of the Student Affairs
              </div>
              <div className="text-xs md:text-sm truncate">
                Counseling and Testing Section
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
              onClick={() => go("/")}
            >
              HOME
            </button>

            <button
              className="text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
              onClick={() => go("/faq")}
            >
              FAQs
            </button>

            <button
              className="text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
              onClick={() => go("/public-forms")}
            >
              FORMS
            </button>

            {!isAuthenticated && (
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => setActiveModal('login')}
                  className="flex items-center gap-1 text-sm px-3 transition duration-200 hover:text-upyellow"
                >
                  LOG IN
                </button>
              </div>
            )}
            {activeModal === 'login' && <LoginModal onClose={() => setActiveModal(null)} onSwitchToSignup={() => setActiveModal('signup')}/>}

            {activeModal === 'signup' && <SignUpModal onClose={() => setActiveModal(null)} onSwitchToLogin={() => setActiveModal('login')} />}

            {isAuthenticated && (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserDropdown((s) => !s)}
                  className="inline-flex items-center gap-2 text-sm px-3 transition hover:text-upyellow"
                >
                  <User size={16} />
                  <span className="max-w-[120px] truncate">{nickname}</span>
                  <ChevronDown
                    size={14}
                    className={`${
                      showUserDropdown ? "rotate-180" : ""
                    } transition`}
                  />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-900 rounded shadow-lg w-56 z-50">
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="bg-upmaroon text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {fullName?.charAt(0) || "U"}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">
                            {fullName || nickname}
                          </div>
                          {idNumber && (
                            <div className="text-sm text-gray-600">
                              ID: {idNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col text-center">
                      {role === "student" && (
                        <>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => go("/myprofile")}
                          >
                            My Profile
                          </button>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => go("/public-forms")}
                          >
                            Forms
                          </button>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => go("/privacy-setting")}
                          >
                            Privacy Setting
                          </button>
                        </>
                      )}

                      {role === "admin" && (
                        <>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => go("/admin")}
                          >
                            Dashboard
                          </button>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => go("/admin-student-list")}
                          >
                            Student List
                          </button>
                        </>
                      )}

                      <button
                        className="w-full px-4 py-2 text-red-700 hover:bg-gray-100"
                        onClick={openLogoutConfirm}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <button
                className="text-white text-sm px-4 py-1 rounded-full border border-white inline-flex items-center justify-center hover:bg-white hover:text-upmaroon transition"
                style={{ minWidth: 72 }}
                  onClick={() => setActiveModal('signup')}
              >
                SIGN UP
              </button>
            )}
          </div>

          {/* Mobile icon group (right side) */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <button
                className="text-white p-1"
                onClick={() => go(role === "admin" ? "/admin" : "/student")}
              >
                <Home />
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white p-1 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile expanded menu  */}
        {mobileOpen && (
          <div className="md:hidden bg-upmaroon border-t border-white/10">
            <div className="px-4 py-4 flex flex-col items-center gap-3">
              <button
                onClick={() => go("/")}
                className="w-full text-center text-white uppercase py-2 transition duration-200 ease-in-out transform hover:text-yellow-500 hover:font-bold "
              >
                HOME
              </button>
              <button
                onClick={() => go("/faq")}
                className="w-full text-center text-white uppercase py-2 transition duration-200 ease-in-out transform hover:text-yellow-500 hover:font-bold"
              >
                FAQS
              </button>
              <button
                onClick={() => go("/public-forms")}
                className="w-full text-center text-white uppercase py-2 transition duration-200 ease-in-out transform hover:text-yellow-500 hover:font-bold"
              >
                FORMS
              </button>

              {!isAuthenticated && (
                <div className="w-full" ref={loginRef}>
                  <button
                    onClick={() => setshowLoginModal((s) => !s)}
                    className="w-full text-center text-white uppercase py-2 inline-flex justify-center items-center gap-2 transition duration-200 ease-in-out transform hover:text-yellow-500 hover:font-bold"
                  >
                    LOG IN{" "}
                    <ChevronDown
                      size={14}
                      className={`${
                        showLoginModal ? "rotate-180" : ""
                      } transition`}
                    />
                  </button>
                </div>
              )}

              {isAuthenticated && (
                <div className="w-full" ref={userRef}>
                  <button
                    onClick={() => setShowUserDropdown((s) => !s)}
                    className="w-full text-center text-white uppercase py-2 inline-flex justify-center items-center gap-2"
                  >
                    {nickname}{" "}
                    <ChevronDown
                      size={14}
                      className={`${
                        showUserDropdown ? "rotate-180" : ""
                      } transition`}
                    />
                  </button>

                  {showUserDropdown && (
                    <div className="mt-2 bg-white text-gray-900 rounded w-full">
                      <div className="px-4 py-3 border-b text-left">
                        <div className="font-semibold">
                          {fullName || nickname}
                        </div>
                        {idNumber && (
                          <div className="text-sm text-gray-600">
                            ID: {idNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        {role === "student" && (
                          <>
                            <button
                              className="w-full text-center px-3 py-2 hover:bg-gray-100"
                              onClick={() => go("/myprofile")}
                            >
                              My Profile
                            </button>
                            <button
                              className="w-full text-center px-3 py-2 hover:bg-gray-100"
                              onClick={() => go("/public-forms")}
                            >
                              Forms
                            </button>
                          </>
                        )}

                        {role === "admin" && (
                          <button
                            className="w-full text-center px-3 py-2 hover:bg-gray-100"
                            onClick={() => go("/admin")}
                          >
                            Dashboard
                          </button>
                        )}

                        <button
                          className="w-full text-center px-3 py-2 text-red-700 hover:bg-gray-100"
                          onClick={openLogoutConfirm}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <button
                  className="mt-2 text-white text-sm rounded-full border border-white px-6 py-2 hover:bg-white hover:text-upmaroon transition hover:font-bold"
                >
                  SIGN UP
                </button>
              )}

              {showSignupModal && (
                <SignUpModal/>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* logout confirm dialog */}
      <Dialog
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
      >
        <DialogTitle>Log out</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmLogout}>
            Log out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
