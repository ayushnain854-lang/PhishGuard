import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user data exists in localStorage
    const savedToken = localStorage.getItem("pg_token");
    const savedUser = localStorage.getItem("pg_user");
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Clear corrupt data
        localStorage.removeItem("pg_token");
        localStorage.removeItem("pg_user");
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem("pg_token", data.token);
      localStorage.setItem("pg_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Invalid credentials! Please try again.";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.signup(username, email, password);
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem("pg_token", data.token);
      localStorage.setItem("pg_user", JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      const message = error.response?.data?.message || "Registration failed! User may already exist.";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_user");
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    loginUser,
    registerUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
