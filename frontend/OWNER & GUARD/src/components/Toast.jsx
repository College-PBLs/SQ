import React from "react";
import { useApp } from "../context/AppContext";

const BG = { success: "#28a745", error: "#dc3545", info: "#17a2b8", warning: "#ffc107" };
const TEXT = { success: "#fff", error: "#fff", info: "#fff", warning: "#333" };

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={s.area}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...s.toast, background: BG[t.type] || BG.success, color: TEXT[t.type] || TEXT.success }}>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

const s = {
  area: {
    position: "fixed", top: 74, right: 18, zIndex: 9999,
    display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
  },
  toast: {
    padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,.2)", maxWidth: 300,
    animation: "toastIn .2s ease forwards",
  },
};
