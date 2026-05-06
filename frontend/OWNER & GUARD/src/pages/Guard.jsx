import React, { useState, useEffect, useCallback } from "react";
import { guardAPI } from "../services/api";
import { useApp } from "../context/AppContext";
import { BASE_URL } from "../services/api";

const emptyForm = { full_name: "", email: "", phone: "" };

export default function Guard() {
  const { addToast } = useApp();
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedGuard, setSelectedGuard] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await guardAPI.getAll();
      setGuards(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFieldErrors({});
    try {
      await guardAPI.create(form.full_name, form.email, form.phone);
      addToast("Guard added successfully");
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      if (err.data?.error && typeof err.data.error === "object") {
        setFieldErrors(err.data.error);
      } else {
        addToast(err.message, "error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemove = async (g) => {
    const name = g.user_detail?.full_name || "this guard";
    if (!window.confirm(`Remove ${name}?`)) return;
    try {
      await guardAPI.remove(g.id);
      addToast(`${name} removed`);
      if (selectedGuard?.id === g.id) setSelectedGuard(null);
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  };

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const getError = (key) => fieldErrors[key]?.[0];

  const getPhoto = (g) => {
    const photo = g.user_detail?.profile_photo;
    if (!photo) return null;
    return photo.startsWith("http") ? photo : `${BASE_URL}${photo}`;
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-end justify-between mb-4.5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black tracking-tight">Guard Access</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage guards with QR scan access at your store exit</p>
        </div>
        <button className="px-4 py-2 bg-gray-800 text-white border-none rounded-md text-xs font-semibold cursor-pointer font-inherit" onClick={() => { setForm(emptyForm); setFieldErrors({}); setModalOpen(true); }}>
          Add Guard
        </button>
      </div>

      {!loading && error && (
        <div className="flex gap-3 bg-white border border-gray-300 rounded-lg p-3 mb-4 text-xs text-gray-400 items-start">
          Error: {error}
        </div>
      )}

      <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4.5 items-start">
        <div>
          <div className="font-bold text-gray-700 text-sm">How it works</div>
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Guards receive login credentials via email and can scan customer QR codes at your exit gate. They cannot access the dashboard.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4 items-start">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : guards.length === 0 ? (
            <div className="text-center p-12.5">
              <div className="text-sm font-bold text-gray-500 mb-4">No guards assigned yet</div>
              <button className="px-4 py-2 bg-gray-800 text-white border-none rounded-md text-xs font-semibold cursor-pointer font-inherit" onClick={() => setModalOpen(true)}>Add Your First Guard</button>
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Role", "Action"].map((h) => (
                    <th key={h} className="p-2.5 text-xs font-semibold uppercase text-gray-400 text-left bg-gray-100 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guards.map((g) => {
                  const u = g.user_detail || {};
                  const photo = getPhoto(g);
                  const active = selectedGuard?.id === g.id;
                  return (
                    <tr key={g.id} className={`border-b border-gray-100 transition-colors duration-150 ${active ? "bg-gray-100" : "bg-transparent"}`}>
                      <td className="p-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          {photo ? (
                            <img src={photo} alt={u.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">{(u.full_name || "G")[0].toUpperCase()}</div>
                          )}
                          <div>
                            <div className="font-semibold text-xs text-black">{u.full_name || "—"}</div>
                            <div className="text-xs text-gray-400">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-gray-700">{u.email || "—"}</td>
                      <td className="p-3 text-xs text-gray-700">{u.phone || "—"}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold">Guard</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1.5">
                          <button className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-700 cursor-pointer font-inherit" onClick={() => setSelectedGuard(active ? null : g)}>
                            {active ? "Hide" : "View"}
                          </button>
                          <button className="px-2.5 py-1 bg-red-100 border-none rounded text-xs font-semibold text-red-600 cursor-pointer font-inherit" onClick={() => handleRemove(g)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selectedGuard && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-20">
            <div className="flex items-center gap-2.5 mb-4 pb-3.5 border-b border-gray-100">
              {getPhoto(selectedGuard) ? (
                <img src={getPhoto(selectedGuard)} alt="" className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
                  {(selectedGuard.user_detail?.full_name || "G")[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-black">{selectedGuard.user_detail?.full_name}</div>
                <div className="text-xs text-gray-400">Guard · {selectedGuard.store_detail?.store_name}</div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Contact Info</div>
              {[
                ["Email", selectedGuard.user_detail?.email],
                ["Phone", selectedGuard.user_detail?.phone],
                ["City", selectedGuard.user_detail?.city || "—"],
                ["Address", selectedGuard.user_detail?.address || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-black">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="mt-3.5 pt-3 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Store Info</div>
              {[
                ["Store", selectedGuard.store_detail?.store_name],
                ["City", selectedGuard.store_detail?.city],
                ["Plan", selectedGuard.store_detail?.plan],
                ["Active", selectedGuard.store_detail?.is_active ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-black">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="mt-3.5 pt-3 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Permissions</div>
              <div className="inline-block px-2.5 py-1.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                Scan QR codes at exit gate
              </div>
            </div>

            <button className="w-full px-2.5 py-2.5 bg-red-100 border-none rounded-lg text-xs font-semibold text-red-600 cursor-pointer font-inherit mt-1" onClick={() => handleRemove(selectedGuard)}>
              Remove Guard
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[500] p-4" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-[420px] shadow-lg">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-black">Add Guard</h2>
              <button className="w-7 h-7 border-none rounded bg-gray-100 text-xs cursor-pointer font-inherit text-gray-500" onClick={() => setModalOpen(false)}>X</button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2 mx-4 my-3 text-xs text-gray-500 leading-relaxed">
              A guard account will be created and login credentials will be emailed to them.
            </div>
            <form onSubmit={handleCreate} className="p-4">
              {[
                { key: "full_name", label: "Full Name", type: "text", placeholder: "e.g. Ravi Kumar" },
                { key: "email", label: "Email", type: "email", placeholder: "guard@example.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "9876543210" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} className="flex flex-col gap-1 mb-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                  <input
                    required type={type}
                    className={`px-2.5 py-2 border rounded text-xs text-black outline-none font-inherit bg-gray-50 ${getError(key) ? "border-red-200" : "border-gray-300"}`}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => updateForm(key, e.target.value)}
                  />
                  {getError(key) && <span className="text-xs text-red-600">{getError(key)}</span>}
                </div>
              ))}
              <div className="flex gap-2 justify-end mt-1.5">
                <button type="button" className="px-3.5 py-2 border border-gray-300 rounded bg-white text-xs font-semibold text-gray-700 cursor-pointer font-inherit" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-800 text-white border-none rounded text-xs font-semibold cursor-pointer font-inherit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Guard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
