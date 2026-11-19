import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("socialsphere_user")) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("socialsphere_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("socialsphere_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("socialsphere_token");
        localStorage.removeItem("socialsphere_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("socialsphere_token", data.token);
    localStorage.setItem("socialsphere_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    saveSession(data);
    return data.user;
  };

  const register = async (details) => {
    const { data } = await api.post("/auth/register", details);
    saveSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("socialsphere_token");
    localStorage.removeItem("socialsphere_user");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("socialsphere_user", JSON.stringify(nextUser));
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
