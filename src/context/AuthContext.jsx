import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {

      const response = await api.post("/auth/login", {
        email,
        password
      });

      const userData = response.data;
      // console.log(userData.token);
        localStorage.setItem("primehub_token", userData.token);
        localStorage.setItem("primehub_role", userData.role);    
        localStorage.setItem("primehub_name", userData.name);    
        localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      return userData.role;

    } catch (error) {

      if (error.response) {
        console.error("Login Failed:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Server not responding");
      } else {
        console.error("Axios Error:", error.message);
      }

      throw error;
    }
  };

  const updateUserContext = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-indigo-500 font-bold animate-pulse">
          INITIALIZING SYSTEM...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};