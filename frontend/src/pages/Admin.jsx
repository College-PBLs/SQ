// import { useState, useEffect } from "react";
// import logo from "/src/assets/logo.jpeg";
// import { useNavigate } from "react-router-dom";
// import BASE_URL from '../config';

// export default function Admin() {
//   const [section, setSection] = useState("dashboard");
//   const [stores, setStores] = useState([]);


//   useEffect(() => {
//   const fetchStores = async () => {
//     const token = localStorage.getItem("access_token");
//     if (!token) return;

//     const res = await fetch(`${BASE_URL}/stores/`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await res.json();
//     setStores(Array.isArray(data.data) ? data.data : []);
//   };

//   fetchStores();
// }, []);

//   // Toggle store activation
//   const toggleActivation = async (storeId, isActive) => {
//     const token = localStorage.getItem("access_token");
//     try {
//       const res = await fetch(`${BASE_URL}/store/${storeId}/activation/`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           action: isActive ? "deactivate" : "activate" // matches backend
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setStores(stores.map(s => s.id === storeId ? { ...s, is_active: !isActive } : s));
//       } else {
//         console.error("Failed to update activation", data);
//         alert("Failed to update activation: " + data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error updating activation");
//     }
//   };

//   // Delete store
//   const deleteStore = async (storeId) => {
//     if (!confirm("Are you sure you want to delete this store?")) return;

//     const token = localStorage.getItem("access_token");
//     try {
//       const res = await fetch(`${BASE_URL}/store/delete/${storeId}/`, {
//         method: "DELETE",
//         headers: { "Authorization": `Bearer ${token}` },
//       });
//       if (res.ok) {
//         setStores(stores.filter(s => s.id !== storeId));
//       } else {
//         console.error("Failed to delete store");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };
  
//   const navigate = useNavigate();
//   const handleLogout = () => {
//     console.log("hello")
//     localStorage.removeItem("access_token");
//     navigate("/");
//   };

//   return (
//     <>
//       <nav className="flex justify-between p-4 shadow">
//          <img src={logo} alt="logo" className="h-10" />
//         <div className="flex gap-4">
//           <button onClick={() => setSection("dashboard")}>Dashboard</button>
//           <button onClick={() => setSection("stores")}>Stores</button>
//           <button onClick={handleLogout}>Logout</button>
//         </div>
//       </nav>

//       <div className="p-4">
//         {/* DASHBOARD */}
//         {section === "dashboard" && (
//           <div>
//             <h2 className="text-2xl font-bold mb-4">Welcome Admin</h2>
//             <p>Total Stores: {stores.length}</p>
//             <p>Active Stores: {stores.filter(s => s.is_active).length}</p>
//             <p>Inactive Stores: {stores.filter(s => !s.is_active).length}</p>
//           </div>
//         )}

//         {/* STORES */}
//         {section === "stores" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             {stores.map(store => (
//               <div key={store.id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
//                 <h2 className="text-lg font-bold">{store.store_name}</h2>
//                 <p>Owner: {store.user.full_name}</p>
//                 <p>Location: {store.address}, {store.city}</p>
//                 <p>Plan: {store.plan} ({store.payment_frequency})</p>
//                 <p>UPI: {store.upi_id}</p>
//                 <p>Status: {store.is_active ? "Active" : "Inactive"}</p>
//                 <div className="flex gap-2 mt-2">
//                   <button
//                     className={`px-2 py-1 rounded text-white ${store.is_active ? "bg-teal-500" : "bg-yellow-500"}`}
//                     onClick={() => toggleActivation(store.id, store.is_active)}
//                   >
//                     {store.is_active ? "Deactivate" : "Activate"}
//                   </button>
//                   <button
//                     className="bg-red-500 text-white px-2 py-1 rounded"
//                     onClick={() => deleteStore(store.id)}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }



import { useState, useEffect } from "react";
import logo from "/src/assets/logo.jpeg";
import { useNavigate } from "react-router-dom";
import BASE_URL from '../config';

export default function Admin() {
  const [section, setSection] = useState("dashboard");
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${BASE_URL}/stores/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setStores(Array.isArray(data.data) ? data.data : []);
    };
    fetchStores();
  }, []);

  const toggleActivation = async (storeId, isActive) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${BASE_URL}/store/${storeId}/activation/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: isActive ? "deactivate" : "activate" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStores(stores.map(s => s.id === storeId ? { ...s, is_active: !isActive } : s));
      } else {
        alert("Failed to update activation: " + data.message);
      }
    } catch (err) {
      alert("Error updating activation");
    }
  };

  const deleteStore = async (storeId) => {
    if (!confirm("Are you sure you want to delete this store?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${BASE_URL}/store/delete/${storeId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStores(stores.filter(s => s.id !== storeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 bg-white/70 backdrop-blur-sm border-b border-teal-100">
        <img src={logo} alt="logo" className="h-16 object-contain" />
        <div className="flex gap-3">
          <button
          
            onClick={() => setSection("dashboard")}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold border-2 transition-colors ${
              section === "dashboard"
                ? "bg-teal-500 text-white border-teal-500"
                : "text-teal-700 border-teal-300 hover:bg-teal-500 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSection("stores")}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold border-2 transition-colors ${
              section === "stores"
                ? "bg-teal-500 text-white border-teal-500"
                : "text-teal-700 border-teal-300 hover:bg-teal-500 hover:text-white"
            }`}
          >
            Stores
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-2xl text-sm font-semibold border-2 border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 px-10 py-10">

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">Overview</h2>
              <p className="text-gray-500 text-sm mt-1">All stores at a glance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mb-10">
              <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Stores</p>
                <p className="text-4xl font-extrabold text-teal-500">{stores.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Active</p>
                <p className="text-4xl font-extrabold text-teal-700">{stores.filter(s => s.is_active).length}</p>
                <span className=" text-xs text-teal-700 font-semibold">Running</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Inactive</p>
                <p className="text-4xl font-extrabold text-amber-500">{stores.filter(s => !s.is_active).length}</p>
                <span className="text-xs text-amber-700  font-semibold">Paused</span>
              </div>
            </div>
          </div>
        )}

        {/* STORES */}
        {section === "stores" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">All Stores</h2>
              <p className="text-gray-500 text-sm mt-1">Manage and control store access</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stores.map(store => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-gray-900">{store.store_name}</h3>
                    <span className={`text-xs px-3 py-0.5 rounded-full font-semibold ${
                      store.is_active
                        ? "bg-teal-100 text-teal-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {store.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Owner: {store.user.full_name}</p>
                  <p className="text-xs text-gray-500 mb-1">Location: {store.address}, {store.city}</p>
                  <p className="text-xs text-gray-500 mb-1">Plan: {store.plan} ({store.payment_frequency})</p>
                  <p className="text-xs text-gray-500 mb-4">UPI: {store.upi_id}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActivation(store.id, store.is_active)}
                      className={`flex-1 py-2 rounded-xl text-white text-xs font-semibold transition-all ${
                        store.is_active
                          ? "bg-teal-500 hover:bg-teal-700"
                          : "bg-amber-400 hover:bg-amber-600"
                      }`}
                    >
                      {store.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteStore(store.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-200 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}