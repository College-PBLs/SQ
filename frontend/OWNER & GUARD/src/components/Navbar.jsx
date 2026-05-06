import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../services/api";

const NAV_ITEMS = [
  { id: "products",  label: "Products" },
  { id: "orders",    label: "Orders" },
  { id: "guard",     label: "Guard Access" },
];

export default function Navbar() {
  const { navigate, currentPage, owner, store, logout } = useApp();
  const [ddOpen, setDdOpen]       = useState(false);
  const ddRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!ddRef.current?.contains(e.target)) setDdOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (id) => {
    navigate(id);
    setDdOpen(false);
  };

  // Resolve logo / profile photo absolute URL
  const photoUrl = owner.profilePhoto
    ? owner.profilePhoto.startsWith("http")
      ? owner.profilePhoto
      : `${BASE_URL}${owner.profilePhoto}`
    : null;

  const logoUrl = store?.logo
    ? store.logo.startsWith("http")
      ? store.logo
      : `${BASE_URL}${store.logo}`
    : "/logo.jpeg";

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-[300] shadow-sm">
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {logoUrl ? (
          <img src={logoUrl} alt="Store Logo" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-2xl font-black text-black">SQ</span>
          </div>
        )}
        <div>
          <div className="text-base font-bold text-black">{store?.store_name || "SQ"}</div>
        </div>
      </div>

      <div ref={ddRef} className="relative flex-shrink-0">
        <button className="flex items-center gap-2.5 py-1.5 pr-3 pl-1.5 rounded-full border border-gray-300 bg-gray-100 cursor-pointer transition-all duration-150 font-inherit" onClick={() => setDdOpen((v) => !v)}>
          {photoUrl ? (
            <img src={photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-black">{owner.initials}</div>
          )}
          <div className="text-left">
            <div className="text-sm font-bold text-black">{store?.store_name || "SQ"}</div>
            <div className="text-xs text-gray-500 font-medium">{owner.name}</div>
          </div>
          <span className={`text-xs text-gray-400 transition-transform duration-200 ml-0.5 ${ddOpen ? "rotate-180" : "rotate-0"}`}>▾</span>
        </button>

        {ddOpen && (
          <div className="absolute right-0 top-[calc(100%+10px)] bg-white border border-gray-300 rounded-lg w-60 shadow-lg overflow-hidden z-[400]">
            <div className="p-3 bg-gray-50 flex gap-3 items-center border-b border-gray-200">
              {photoUrl ? (
                <img src={photoUrl} alt="avatar" className="w-10.5 h-10.5 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-black flex-shrink-0">{owner.initials}</div>
              )}
              <div>
                <div className="text-sm font-bold text-black">{owner.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{owner.email}</div>
                <span className="inline-block mt-1 bg-gray-100 text-black text-xs font-bold py-0.5 px-2 rounded-full">{(owner.role || "owner").toUpperCase()}</span>
              </div>
            </div>
            {store && (
              <div className="p-3 bg-gray-50">
                <div className="text-xs font-bold text-gray-500 mb-1">Store Details</div>
                <div className="text-sm font-bold text-black mb-0.5">{store.store_name}</div>
                <div className="text-xs text-gray-500">
                  {store.address}, {store.city}, {store.state} {store.pincode}
                </div>
              </div>
            )}
            <div className="h-px bg-gray-200 my-0.5" />
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className="flex items-center gap-2.5 p-2.5 w-full border-none bg-transparent text-sm font-medium text-gray-700 cursor-pointer text-left transition-all duration-100 font-inherit relative" onClick={() => handleNavigation(item.id)}>
                {item.label}
                {currentPage === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            ))}
            <div className="h-px bg-gray-200 my-0.5" />
            <button className="flex items-center gap-2.5 p-2.5 w-full border-none bg-transparent text-sm font-medium text-red-600 cursor-pointer text-left transition-all duration-100 font-inherit relative" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
