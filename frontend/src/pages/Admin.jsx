import { useState, useEffect } from "react";

export default function Admin() {
  const [section, setSection] = useState("dashboard");
  const [stores, setStores] = useState([]);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch("http://localhost:8001/stores/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.status === 401) return;

        const data = await res.json();
        setStores(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching stores:", err);
      }
    };

    if (section === "dashboard" || section === "stores") fetchStores();
  }, [section]);

  // Toggle store activation
  const toggleActivation = async (storeId, isActive) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8001/store/${storeId}/activation/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: isActive ? "deactivate" : "activate" // matches backend
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStores(stores.map(s => s.id === storeId ? { ...s, is_active: !isActive } : s));
      } else {
        console.error("Failed to update activation", data);
        alert("Failed to update activation: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating activation");
    }
  };

  // Delete store
  const deleteStore = async (storeId) => {
    if (!confirm("Are you sure you want to delete this store?")) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8001/store/delete/${storeId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setStores(stores.filter(s => s.id !== storeId));
      } else {
        console.error("Failed to delete store");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="flex justify-between border shadow shadow-pink-900 p-3">
        <div className="font-bold text-xl">Admin Panel</div>
        <div className="flex gap-4">
          <button onClick={() => setSection("dashboard")}>Dashboard</button>
          <button onClick={() => setSection("stores")}>Stores</button>
        </div>
      </nav>

      <div className="p-4">
        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Welcome Admin</h2>
            <p>Total Stores: {stores.length}</p>
            <p>Active Stores: {stores.filter(s => s.is_active).length}</p>
            <p>Inactive Stores: {stores.filter(s => !s.is_active).length}</p>
          </div>
        )}

        {/* STORES */}
        {section === "stores" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {stores.map(store => (
              <div key={store.id} className="p-4 bg-white rounded shadow hover:shadow-lg transition">
                <h2 className="text-lg font-bold">{store.store_name}</h2>
                <p>Owner: {store.user.full_name}</p>
                <p>Location: {store.address}, {store.city}</p>
                <p>Plan: {store.plan} ({store.payment_frequency})</p>
                <p>UPI: {store.upi_id}</p>
                <p>Status: {store.is_active ? "Active" : "Inactive"}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    className={`px-2 py-1 rounded text-white ${store.is_active ? "bg-green-500" : "bg-yellow-500"}`}
                    onClick={() => toggleActivation(store.id, store.is_active)}
                  >
                    {store.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteStore(store.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}