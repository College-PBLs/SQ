import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { profileAPI, authAPI } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState("products");
  const [toasts, setToasts] = useState([]);
  const [user, setUser] = useState(null);   // UserObject from GET profile/
  const [store, setStore] = useState(null); // StoreObject (owner only)
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Load profile on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("mart_token");
    if (!token) { setProfileLoading(false); return; }
    profileAPI
      .get()
      .then((res) => {
        setUser(res.user || null);
        setStore(res.store || null);
      })
      .catch(() => {
        // Token invalid / expired — clear it
        localStorage.removeItem("mart_token");
      })
      .finally(() => setProfileLoading(false));
  }, []);

  // ── Toast ─────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3400
    );
  }, []);

  // ── Navigation ────────────────────────────────────────────
  const navigate = useCallback((page) => setCurrentPage(page), []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem("mart_token");
    setUser(null);
    setStore(null);
    setCurrentPage("products");
    addToast("Logged out", "info");
  }, [addToast]);

  // ── Refresh profile (call after PUT profile/ or PUT store/update/) ─
  const refreshProfile = useCallback(async () => {
    try {
      const res = await profileAPI.get();
      setUser(res.user || null);
      setStore(res.store || null);
    } catch (_) {}
  }, []);

  // ── Derived owner display data (safe fallbacks) ──────────
  const owner = {
    name: user?.full_name || "Owner",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "owner",
    initials: (user?.full_name || "O")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    profilePhoto: user?.profile_photo || null,
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        toasts,
        addToast,
        owner,
        user,
        setUser,
        store,
        setStore,
        profileLoading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
