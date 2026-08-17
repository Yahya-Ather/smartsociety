import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

const STORAGE_KEY = "smartsociety.auth.user";

function initialsFrom(name) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Validates credentials and establishes the session directly — no OTP step.
  async function login(username, password) {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      // api.js's request interceptor reads the token back out of this same
      // stored object, so it has to ride along with the rest of the user data.
      const enrichedUser = {
        ...data.user,
        initials: initialsFrom(data.user.name),
        token: data.token,
      };
      setUser(enrichedUser);
      return { ok: true, user: enrichedUser };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid username or password.";
      return { ok: false, error: message };
    }
  }

  function logout() {
    setUser(null);
  }

  // Patches the locally-cached profile fields after a successful /api/profile
  // edit, so the navbar/greetings update immediately without a re-login.
  function updateUser(patch) {
    setUser((u) => {
      if (!u) return u;
      const next = { ...u, ...patch };
      if (patch.name) next.initials = initialsFrom(patch.name);
      return next;
    });
  }

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
