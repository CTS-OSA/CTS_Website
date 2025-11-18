// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getRole as getStoredRole,
} from "../utils/cookieUtils";
import { apiRequest } from "../utils/apiUtils";
import { isRefreshTokenExpired, refreshToken } from "../utils/refreshUtils";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => getStoredRole() || null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = getToken();
    const refresh = getRefreshToken();

    if (token && !isTokenExpired(token)) {
      // Access token is valid, proceed with setting role and fetching user data
      setRoleFromToken(token);
      fetchUserData(token);
    } else if (refresh && !isRefreshTokenExpired(refresh)) {
      // Access token is missing, but we have a valid refresh token, attempt to refresh
      const handleTokenRefresh = async () => {
        const { success } = await refreshToken();
        if (success) {
          const newToken = getToken();
          setRoleFromToken(newToken);
          fetchUserData(newToken);
        } else {
          clearAuthData();
        }
      };

      handleTokenRefresh();
    } else {
      // Both access token and refresh token are missing or expired
      clearAuthData();
    }
  }, []);
  const fetchUserData = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentRole = decoded.role;

      const userRes = await apiRequest("http://localhost:8000/auth/users/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userRes.ok) throw new Error("User fetch failed");
      const userData = await userRes.json();
      setUser(userData);

      if (currentRole === "student") {
        const profileRes = await apiRequest(
          "http://localhost:8000/api/forms/student/profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          setProfileData(profileJson);
        } else if (profileRes.status === 404) {
          setProfileData({});
        } else {
          throw new Error("Failed to fetch student profile");
        }
      }

      else if (currentRole === "admin") {
      const profileRes = await apiRequest(
        "http://localhost:8000/api/forms/counselors/me/", 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfileData(profileJson);
      } else if (profileRes.status === 404) {
        setProfileData({});
      } else {
        throw new Error("Failed to fetch staff profile");
      }
    }

      setLoading(false);
    } catch (err) {
      console.error("User/profile fetch failed", err);
      clearAuthData();
    }
  };

  const clearAuthData = () => {
    removeToken();
    setUser(null);
    setRole(null);
    setLoading(false);
  };

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      console.error("Token decode error:", err);
      return true;
    }
  };

  const login = async (email, password, loginRole) => {
    setAuthError(null);
    try {
      const res = await fetch(
        "http://localhost:8000/api/users/auth/jwt/create/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role: loginRole }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        setAuthError(errData?.detail || "Login failed");
        throw new Error(errData?.detail || "Login failed");
      }

      const data = await res.json();
      if (!data.access) throw new Error("No access token received");

      setToken(data.access);
      setRefreshToken(data.refresh);
      setRoleFromToken(data.access);
      await fetchUserData(data.access);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const setRoleFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.error("Role decode error:", err);
    }
  };

  const logout = async (navigate) => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await fetch("http://localhost:8000/api/users/auth/jwt/logout/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
      } catch (err) {
        console.error("Logout API error:", err);
      }
    }
    removeRefreshToken();
    removeToken();
    setUser(null);
    setRole(null);
    setProfileData(null);
    navigate("/");
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profileData,
        setProfileData,
        login,
        logout,
        authError,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
