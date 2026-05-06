import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/Toast";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Guard from "./pages/Guard";

const PAGES = {
  products: Products,
  orders: Orders,
  guard: Guard,
};

function PageRouter() {
  const { currentPage } = useApp();
  const Page = PAGES[currentPage] || Products;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }}>
      <Page />
    </div>
  );
}

export default function OwnerApp({ setRole }) {
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
  };

  return (
    <AppProvider>
      <Navbar logout={logout} />
      <PageRouter />
      <ToastContainer />
    </AppProvider>
  );
}