import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./css/SideNav1.css";
import {
  PersonOutline,
  DashboardOutlined,
  SettingsOutlined,
  PeopleOutline,
  DescriptionOutlined,
  AnalyticsOutlined,
  BuildOutlined,
  HelpOutline,
  LogoutOutlined,
} from "@mui/icons-material";
import ModalMessage from './ModalMessage';
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

const SideNav = ({ variant }) => {
  const { user, profileData, loading, logout } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();


  const firstName = profileData?.first_name || user?.first_name || "First";
  const lastName = profileData?.last_name || user?.last_name || "Last";
  const email = user?.email || "user@example.com";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="side-navigator">
        {loading
          ? "Loading..."
          : "You are not authenticated. Redirecting to the home page..."}
      </div>
    );
  }

  const confirmLogout = () => {
    logout(navigate);
    setShowLogoutModal(false);
  };

  return (
    <div className="flex-col p-4 bg-white overflow-hidden h-full shadow-xl lg:block hidden">
      <div className="avatar-section">
        <div className="avatar">
          {firstName.charAt(0)}
          {lastName.charAt(0)}
        </div>
        <div className="user-info">
          <h4>
            {firstName} {lastName}
          </h4>
          <p>{email}</p>
        </div>
      </div>

      <div className="nav-buttons">
        <div className="nav-buttons-top ">
          {variant === "student" ? (
            <>
              <Link to="/myprofile">
                <button>
                  <PersonOutline /> My Profile
                </button>
              </Link>
              <Link to="/student">
                <button>
                  <DashboardOutlined /> Dashboard
                </button>
              </Link>
              <Link to="/public-forms">
                <button>
                  <DescriptionOutlined /> Forms
                </button>
              </Link>
              <Link to="/user-privacy-setting">
                <button>
                  <SettingsOutlined /> Privacy Settings
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin">
                <button>
                  <DashboardOutlined /> Dashboard
                </button>
              </Link>

              <Link to="/admin-student-list">
                <button>
                  <PeopleOutline /> Student
                </button>
              </Link>

              <div className="dropdown">
                <button className="dropdown-button" onClick={() => setDropdownOpen(open => !open)}>
                  <DescriptionOutlined /> Record Management
                </button>
                <div className={`dropdown-content ${dropdownOpen ? "open" : ""}`}>
                  <Link to="/admin-bis-list">
                    <button>
                      <DescriptionOutlined /> Basic Info Sheets
                    </button>
                  </Link>
                  <Link to="/admin-scif-list">
                    <button>
                      <DescriptionOutlined /> SCIF
                    </button>
                  </Link>
                </div>
              </div>

              <Link to="/admin-reports">
                <button>
                  <AnalyticsOutlined /> Report Analytics
                </button>
              </Link>

              <Link to="/admin-audit-log">
                <button>
                  <SettingsOutlined /> System Logs
                </button>
              </Link>

              <Link to="/admin-system-settings">
                <button>
                  <BuildOutlined /> System Settings
                </button>
              </Link>
            </>
          )}
        </div>

        <div className="nav-buttons-bottom">
          <Link to="/help">
            <button>
              <HelpOutline /> Help
            </button>
          </Link>
          
          <button onClick={() => setShowLogoutModal(true)}>
            <LogoutOutlined /> Log out
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <ModalMessage
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          onClose={() => setShowLogoutModal(false)}
          buttons={[
            {
              label: "Cancel",
              onClick: () => {},
              className: "modal-cancel-btn",
            },
            {
              label: "Yes, Log Out",
              onClick: confirmLogout,
              className: "modal-confirm-btn",
            },
          ]}
        />
      )}
    </div>
  );
};

export default SideNav;