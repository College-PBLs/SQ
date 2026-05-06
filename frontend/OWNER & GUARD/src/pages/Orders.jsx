import React, { useState, useEffect, useCallback } from "react";
import { ordersAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../services/api";

const getToday = () => new Date().toISOString().slice(0, 10);

const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Orders() {
  const { addToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersAPI.getAll(startDate, endDate);
      setOrders(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  const viewOrder = async (id) => {
    setDetailLoading(true);
    try {
      const res = await ordersAPI.getById(id);
      setSelected(res.data || null);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteOrder = async (o) => {
    if (!window.confirm(`Delete order ${o.order_number}?`)) return;
    try {
      await ordersAPI.delete(o.id);
      addToast("Order deleted", "error");
      setSelected(null);
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  };

  return (
    <div className="p-5 max-w-screen-xl mx-auto">
      <div className="flex items-end justify-between mb-4.5 flex-wrap gap-2.5">
        <div>
          <h1 className="text-2xl font-bold text-black">Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">{loading ? "Loading..." : `${orders.length} order(s)`}</p>
        </div>
      </div>

      {!loading && error && (
        <div className="flex gap-2.5 bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4 text-xs text-yellow-800 items-start">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-2.5 py-2 border border-gray-300 rounded-md text-xs text-gray-700 bg-white font-inherit outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-2.5 py-2 border border-gray-300 rounded-md text-xs text-gray-700 bg-white font-inherit outline-none" />
        </div>
        <button className="px-4 py-2 bg-gray-800 text-white border-none rounded-md text-xs font-semibold cursor-pointer font-inherit" onClick={load}>Search</button>
        <button className="px-3 py-2 border border-gray-300 rounded-md bg-white text-xs font-medium text-gray-700 cursor-pointer font-inherit" onClick={() => { setStartDate(getToday()); setEndDate(getToday()); setTimeout(load, 50); }}>Today</button>
        <button className="px-3 py-2 border border-gray-300 rounded-md bg-white text-xs font-medium text-gray-700 cursor-pointer font-inherit" onClick={load}>Refresh</button>
      </div>

      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12">
            <div className="text-sm font-semibold text-gray-500">No orders found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[700px]">
              <thead>
                <tr>
                  {["Order #", "Customer", "Phone", "Items", "Total", "Date", "Action"].map((h) => (
                    <th key={h} className="p-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 text-left bg-gray-100 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 transition-all duration-100">
                    <td className="p-2.5 font-semibold text-blue-600">{o.order_number}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-xs">{o.user?.full_name || "—"}</div>
                      <div className="text-xs text-gray-400">{o.user?.email}</div>
                    </td>
                    <td className="p-2.5 text-xs">{o.user?.phone || "—"}</td>
                    <td className="p-2.5">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {(o.items || []).length} item(s)
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-black text-sm">
                      ₹{parseFloat(o.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-2.5 text-xs text-gray-500">
                      {formatDate(o.date)}
                    </td>
                    <td className="p-2.5">
                      <button className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 cursor-pointer font-inherit" onClick={() => viewOrder(o.id)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(selected || detailLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[500] p-3.5" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between p-4.5 pb-3.5 border-b border-gray-200">
              <div>
                <h2 className="text-base font-bold text-black">{selected?.order_number || "Loading..."}</h2>
                <div className="text-xs text-gray-500 mt-0.5">{formatDate(selected?.date)}</div>
              </div>
              <div className="flex gap-1.5">
                {selected && (
                  <button className="px-3 py-1.5 bg-red-100 text-red-600 border-none rounded-md text-xs font-semibold cursor-pointer font-inherit" onClick={() => deleteOrder(selected)}>Delete</button>
                )}
                <button className="w-7 h-7 border border-gray-300 rounded-full bg-gray-100 text-sm font-semibold cursor-pointer font-inherit text-gray-700" onClick={() => setSelected(null)}>X</button>
              </div>
            </div>

            {detailLoading ? (
              <div className="p-10 text-center text-gray-400">Loading...</div>
            ) : selected ? (
              <div className="px-5 pb-5">
                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  <div className="text-xs font-bold text-black mb-2.5">Customer Details</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      ["Name", selected.user?.full_name],
                      ["Email", selected.user?.email],
                      ["Phone", selected.user?.phone],
                      ["Address", selected.user?.address ? `${selected.user.address}, ${selected.user.city}` : "—"],
                      ["State", selected.user?.state],
                      ["Pincode", selected.user?.pincode],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-0.5">{label}</div>
                        <div className="text-xs font-semibold text-black">{value || "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.order_qr && (
                  <div className="mt-4 pt-3.5 border-t border-gray-100">
                    <div className="text-xs font-bold text-black mb-2.5">Order QR Code</div>
                    <div className="flex items-center gap-3.5">
                      <img
                        src={selected.order_qr.startsWith("http") ? selected.order_qr : `${BASE_URL}${selected.order_qr}`}
                        alt="Order QR"
                        className="w-[90px] h-[90px] rounded-md border border-gray-300"
                      />
                      <div className="text-xs text-gray-500">
                        Scan at gate for verification
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3.5 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="text-xs font-bold text-black">Items</div>
                    <div className="text-sm font-bold text-black">
                      Total: ₹{parseFloat(selected.total_amount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {(selected.items || []).length === 0 ? (
                    <p className="text-xs text-gray-400">No items recorded.</p>
                  ) : (
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          {["Product", "Qty", "Price", "Subtotal"].map((h) => (
                            <th key={h} className="p-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 text-left bg-gray-100 border-b border-gray-200">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 transition-all duration-100">
                            <td className="p-2.5 text-gray-700">{item.product_detail?.name || `Product #${item.product}`}</td>
                            <td className="p-2.5 text-gray-700">{item.qty}</td>
                            <td className="p-2.5 text-gray-700">₹{parseFloat(item.price_at_purchase || 0).toLocaleString("en-IN")}</td>
                            <td className="p-2.5 font-semibold text-gray-700">
                              ₹{(parseFloat(item.price_at_purchase || 0) * item.qty).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
