import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/upmin-logo.svg";
import { Menu, X, ChevronDown, Home, User } from "react-feather";
import SignUpModal from "./SignUpModal";
import LoginModal from "./LoginModal";
import LogoutModal from "./LogoutModal";
import { getProfilePhotoUrl, getProfileInitials } from "../utils/profileUtils";

export default function Navbar() {
  const { user, logout, isAuthenticated, role, profileData, loading } =
    useContext(AuthContext);

  const [activeModal, setActiveModal] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [showRecordsDropDown, setShowRecordsDropDown] = useState(false);

  const navigate = useNavigate();
  const loginRef = useRef(null);
  const userRef = useRef(null);

  const profilePhotoUrl = getProfilePhotoUrl(profileData || user);
  const profileInitials = getProfileInitials(profileData || user);
  const nickname = profileData?.nickname ?? user?.nickname ?? "User";
  const fullName = `${profileData?.first_name || user?.first_name || ""} ${
    profileData?.last_name || user?.last_name || ""
  }`.trim();
  const userEmail = profileData?.email || user?.email || "";
  const idNumber = profileData?.student_id || user?.student_id || userEmail;

  useEffect(() => {
    const handler = (e) => {
      if (activeModal && e.target.classList.contains("bg-black/50")) {
        setActiveModal(null);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeModal]);

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
    setActiveModal(null);
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
          <Link
            to="/"
            className="flex-1 flex items-center gap-4 no-underline justify-center md:justify-start"
            onClick={() => {
              setMobileOpen(false);
              setActiveModal(null);
            }}
          >
            <img
              src={logo}
              alt="UP Mindanao logo"
              className="h-9 lg:h-16 w-12 lg:w-16 object-contain"
            />
            <div className="leading-tight select-none font-tnr max-w-[300px] text-center md:text-left">
              <div className="text-[11px] lg:text-base md:font-bold">
                University of the Philippines Mindanao
              </div>
              <div className="text-[11px] lg:text-base md:font-semibold truncate mt-0 lg:-mt-1">
                Office of the Student Affairs
              </div>
              <div className="text-[11px] lg:text-base truncate mt-0 lg:-mt-1">
                Counseling and Testing Section
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 ">
            {/* Always visible */}
            <button
              className="sm:text-xs lg:text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
              onClick={() => go("/")}
            >
              HOME
            </button>

            <button
              className="md:text-xs lg:text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
              onClick={() => go("/faq")}
            >
              FAQs
            </button>

            {/* STUDENT + PUBLIC can see FORMS */}
            {(role === "student" || !isAuthenticated) && (
              <button
                className="md:text-xs lg:text-sm px-3 transition duration-200 ease-in-out transform hover:scale-105 hover:text-upyellow"
                onClick={() => go("/public-forms")}
              >
                FORMS
              </button>
            )}

            {/* ADMIN ONLY — RECORD MANAGEMENT */}
            {role === "admin" && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRecordsDropDown((prev) => !prev);
                    setShowUserDropdown(false);
                  }}
                  className="md:text-xs lg:text-sm px-3 flex items-center gap-1 transition duration-200 ease-in-out transform hover:text-upyellow"
                >
                  RECORD MANAGEMENT
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      showRecordsDropDown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showRecordsDropDown && (
                  <div className="absolute right-2 text-sm mt-2 bg-gray-200 text-gray-900 rounded shadow-md w-50 z-50 font-roboto">
                    <Link
                      to="/admin-bis-list"
                      onClick={() => setShowRecordsDropDown(false)}
                      className="block px-4 py-2 hover:bg-gray-50 hover:rounded-t-sm hover:font-semibold"
                    >
                      Basic Information Sheet
                    </Link>
                    <Link
                      to="/admin-scif-list"
                      onClick={() => setShowRecordsDropDown(false)}
                      className="block px-4 py-2 hover:bg-gray-50 hover:font-semibold"
                    >
                      Student Cumulative Information
                    </Link>
                    <Link
                      to="/admin-referral-list"
                      onClick={() => setShowRecordsDropDown(false)}
                      className="block px-4 py-2 hover:bg-gray-50 hover:font-semibold"
                    >
                      Referral Form
                    </Link>
                    <Link
                      to="/admin-pard-list"
                      onClick={() => setShowRecordsDropDown(false)}
                      className="block px-4 py-2 hover:bg-gray-50 hover:rounded-b-sm hover:font-semibold"
                    >
                      Psychosocial Assistance and Referral Desk
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* PUBLIC ONLY – SHOW LOGIN & SIGNUP */}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    setActiveModal("login");
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1 text-sm px-3 transition duration-200 hover:text-upyellow"
                >
                  LOG IN
                </button>

                <button
                  className="text-white text-sm px-4 py-1 rounded-full border border-white hover:bg-white hover:text-upmaroon transition"
                  onClick={() => {
                    setActiveModal("signup");
                    setMobileOpen(false);
                  }}
                >
                  SIGN UP
                </button>
              </>
            )}

            {isAuthenticated && (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => {
                    setShowUserDropdown((prev) => !prev);
                    setShowRecordsDropDown(false);
                  }}
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
                  <div className="absolute right-0 mt-2 bg-gray-200 text-gray-900 rounded shadow-lg w-52 z-50 font-roboto">
                    <div className="px-4 py-3 border-b border-gray-400">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0 rounded-full w-10 h-10 overflow-hidden  text-white flex items-center justify-center font-bold">
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              alt={fullName || nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            profileInitials
                          )}
                        </div>
                        <div className="text-left">
                          <button
                            className="text-left font-semibold hover:cursor-pointer hover:scale-105 transform duration-200 flex-1"
                            onClick={() =>
                              go(
                                role === "admin"
                                  ? "/admin/myprofile"
                                  : "/myprofile"
                              )
                            }
                          >
                            {fullName || nickname}
                          </button>

                          {(idNumber || userEmail) && (
                            <div
                              className="text-[10px] text-gray-600 max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis"
                              title={idNumber || userEmail}
                            >
                              {idNumber || userEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col text-center text-sm">
                      {role === "student" && (
                        <>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100 hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/student")}
                          >
                            Dashboard
                          </button>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100 hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/myprofile")}
                          >
                            My Profile
                          </button>

                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100 hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/public-forms")}
                          >
                            Forms
                          </button>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100 hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/privacy-setting")}
                          >
                            Privacy Setting
                          </button>
                        </>
                      )}

                      {role === "admin" && (
                        <>
                          <button
                            className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/admin")}
                          >
                            Dashboard
                          </button>
                          <button
                            className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/admin-student-list")}
                          >
                            Student List
                          </button>
                          <button
                            className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/admin-reports")}
                          >
                            Report Analytics
                          </button>
                          <button
                            className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold hover:cursor-pointer transition duration-200"
                            onClick={() => go("/admin-system-settings")}
                          >
                            System Settings
                          </button>
                        </>
                      )}

                      <button
                        className="w-full px-4 py-2 text-red-700 rounded-b hover:bg-gray-100 border-t hover:font-semibold border-gray-400"
                        onClick={openLogoutConfirm}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile icon group (right side) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white p-1 focus:outline-none hover:scale-115 transform transition duration-200 ease-in-out w-8 h-8"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile expanded menu  */}
        {mobileOpen && (
          <div className="md:hidden bg-upmaroon border-t border-white/10 font-roboto">
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
              {/* FORMS - only for public users and students */}
              {role !== "admin" && (
                <button
                  onClick={() => go("/public-forms")}
                  className="w-full text-center text-white uppercase py-2 hover:text-yellow-500 hover:font-bold"
                >
                  FORMS
                </button>
              )}

              {role === "admin" && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRecordsDropDown((prev) => !prev);
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-center text-white uppercase py-2 inline-flex justify-center items-center gap-2"
                  >
                    RECORD MANAGEMENT
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        showRecordsDropDown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showRecordsDropDown && (
                    <div className="mt-2 bg-gray-200 text-gray-900 rounded shadow-lg font-roboto ">
                      <Link
                        to="/admin-bis-list"
                        onClick={() => setShowRecordsDropDown(false)}
                        className="block px-4 py-2 hover:bg-gray-50 w-full text-center rounded-t hover:font-medium"
                      >
                        Basic Information Sheet
                      </Link>
                      <Link
                        to="/admin-scif-list"
                        onClick={() => setShowRecordsDropDown(false)}
                        className="block px-4 py-2 hover:bg-gray-50 text-center w-full hover:font-medium"
                      >
                        Student Cumulative Information
                      </Link>
                      <Link
                        to="/admin-referral-list"
                        onClick={() => setShowRecordsDropDown(false)}
                        className="block px-4 py-2 hover:bg-gray-50 text-center w-full rounded-b hover:font-medium"
                      >
                        Referral Form
                      </Link>
                      <Link
                        to="/admin-referral-list"
                        onClick={() => setShowRecordsDropDown(false)}
                        className="block px-4 py-2 hover:bg-gray-50 text-center w-full rounded-b hover:font-medium"
                      >
                        Psychosocial Assistance and Referral Desk
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div className="w-full" ref={loginRef}>
                  <button
                    onClick={() => {
                      setActiveModal("login");
                      setMobileOpen(false);
                    }}
                    className="w-full text-center text-white uppercase py-2 inline-flex justify-center items-center gap-2 transition duration-200 ease-in-out transform hover:text-yellow-500 hover:font-bold"
                  >
                    LOG IN
                  </button>
                </div>
              )}

              {isAuthenticated && (
                <div className="w-full" ref={userRef}>
                  <button
                    onClick={() => setShowUserDropdown((s) => !s)}
                    className="w-full text-center text-white uppercase py-2 inline-flex justify-center items-center gap-2"
                  >
                    {nickname}
                    <ChevronDown
                      size={14}
                      className={`${
                        showUserDropdown ? "rotate-180" : ""
                      } transition`}
                    />
                  </button>

                  {showUserDropdown && (
                    <div className="mt-2 bg-gray-200 text-gray-900 rounded shadow-lg font-roboto">
                      <div className="px-4 py-3 border-b text-center border-gray-400">
                        <button
                          className="font-semibold hover:cursor-pointer hover:scale-105 transition  duration-200 ease-in-out"
                          onClick={() => go("/admin/myprofile")}
                        >
                          {fullName || nickname}
                        </button>
                        {idNumber && (
                          <div className="text-xs text-gray-600">
                            {idNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        {role === "student" && (
                          <>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/myprofile")}
                            >
                              My Profile
                            </button>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/public-forms")}
                            >
                              Forms
                            </button>
                          </>
                        )}

                        {role === "admin" && (
                          <>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/admin")}
                            >
                              Dashboard
                            </button>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/admin-student-list")}
                            >
                              Student List
                            </button>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/admin-reports")}
                            >
                              Report Analytics
                            </button>
                            <button
                              className="block px-4 py-2 hover:bg-gray-50  w-full hover:font-semibold"
                              onClick={() => go("/admin-student-list")}
                            >
                              System Settings
                            </button>
                          </>
                        )}

                        <button
                          className="w-full text-center px-3 py-2 text-red-700 hover:bg-gray-100"
                          onClick={openLogoutConfirm}
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <button
                  className="mt-2 text-white text-sm rounded-full border border-white px-6 py-2 hover:bg-white hover:text-upmaroon transition hover:font-bold"
                  onClick={() => {
                    setActiveModal("signup");
                    setMobileOpen(false);
                  }}
                >
                  SIGN UP
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* logout confirm modal */}
      <LogoutModal
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
        onConfirm={confirmLogout}
      />

      {activeModal === "login" && (
        <LoginModal
          onClose={() => setActiveModal(null)}
          onSwitchToSignup={() => setActiveModal("signup")}
        />
      )}
      {activeModal === "signup" && (
        <SignUpModal
          onClose={() => setActiveModal(null)}
          onSwitchToLogin={() => setActiveModal("login")}
        />
      )}
    </>
  );
}
