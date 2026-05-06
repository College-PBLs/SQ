import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { productsAPI, BASE_URL } from "../services/api";

/* ── Constants ─────────────────────────────────────────────── */

const UNIT_OPTIONS = ["kg", "g", "ml", "l", "cm", "m", "inch", "unit"];

const EMPTY_FORM = {
  name: "",
  price: "",
  qty: "",
  expiry: "",
  value: "",
  unit: "unit",
  photo: null,
};

/* ── Date helpers ──────────────────────────────────────────── */

function isExpired(date) {
  return date && new Date(date) < new Date();
}

function isExpiringSoon(date) {
  if (!date) return false;
  const daysLeft = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return daysLeft >= 0 && daysLeft <= 30;
}

function resolveImageUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

function formatPrice(amount) {
  return `₹${parseFloat(amount || 0).toLocaleString("en-IN")}`;
}

/* ── Sub-Components ────────────────────────────────────────── */

// The search bar with clear button
function SearchBar({ value, onChange, onClear, onRefresh }) {
  return (
    <div style={styles.toolbar}>
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, product number…"
          style={styles.searchInput}
        />
        {value && (
          <button style={styles.clearButton} onClick={onClear}>
            ✕
          </button>
        )}
      </div>
      <button style={styles.refreshButton} onClick={onRefresh}>
        ↻ Refresh
      </button>
    </div>
  );
}

// Empty state placeholder
function EmptyState({ hasProducts, onAdd }) {
  return (
    <div style={styles.emptyBox}>
      <div style={styles.emptyIcon}>📦</div>
      <div style={styles.emptyTitle}>
        {hasProducts ? "No results found" : "No products yet"}
      </div>
      <div style={styles.emptyHint}>
        {hasProducts
          ? "Try a different search term."
          : "Add your first product. It will appear here once created."}
      </div>
      {!hasProducts && (
        <button style={styles.primaryButton} onClick={onAdd}>
          + Add First Product
        </button>
      )}
    </div>
  );
}

// A single product card
function ProductCard({ product, onEdit, onDelete, onQR }) {
  const [hovered, setHovered] = useState(false);

  const expired = isExpired(product.expiry);
  const expiring = isExpiringSoon(product.expiry);
  const photoUrl = resolveImageUrl(product.photo);

  // Pick border color based on expiry status
  const borderColor = expired
    ? "#fca5a5"
    : expiring
    ? "#fde68a"
    : "#e8ecf2";

  return (
    <div
      style={{
        ...styles.card,
        borderColor,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 32px rgba(0,180,160,.14)"
          : "0 2px 8px rgba(0,0,0,.04)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Expiry warning banner */}
      {(expired || expiring) && (
        <div
          style={{
            background: expired ? "#fee2e2" : "#fef3c7",
            color: expired ? "#991b1b" : "#92400e",
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 700,
            textAlign: "center",
            letterSpacing: 0.3,
          }}
        >
          {expired ? " EXPIRED" : " Expiring Soon"}
        </div>
      )}

      {/* Product thumbnail */}
      <div style={styles.thumbnail}>
        {photoUrl ? (
          <img src={photoUrl} alt={product.name} style={styles.thumbnailImage} />
        ) : (
          <span style={{ fontSize: 44, opacity: 0.7 }}>📦</span>
        )}
      </div>

      {/* Card content */}
      <div style={styles.cardContent}>
        <div style={styles.productName}>{product.name}</div>
        <div style={styles.productNumber}>{product.product_number}</div>

        {/* Price and unit row */}
        <div style={styles.priceRow}>
          <span style={styles.priceTag}>{formatPrice(product.price)}</span>
          <span style={styles.unitBadge}>
            {product.value ? `${product.value} ${product.unit}` : product.unit}
          </span>
        </div>

        {/* Expiry and quantity info */}
        <div style={styles.infoStrip}>
          <div style={styles.infoCell}>
            <span style={styles.infoLabel}>EXP</span>
            <span
              style={{
                ...styles.infoValue,
                color: expired ? "#e53935" : expiring ? "#f5a623" : "#3d4f5c",
              }}
            >
              {product.expiry || "—"}
            </span>
          </div>
          <div style={styles.infoCell}>
            <span style={styles.infoLabel}>QTY</span>
            <span style={styles.infoValue}>{product.qty ?? "—"}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={styles.actionRow}>
          <button style={styles.qrButton} onClick={() => onQR(product)}>
            QR
          </button>
          <button style={styles.editButton} onClick={() => onEdit(product)}>
             Edit
          </button>
          <button style={styles.deleteButton} onClick={() => onDelete(product)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal for adding/editing a product
function ProductModal({ isOpen, editItem, onClose, onSaved, addToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editItem) {
      setForm({
        name: editItem.name || "",
        price: editItem.price || "",
        qty: editItem.qty ?? "",
        expiry: editItem.expiry || "",
        value: editItem.value || "",
        unit: editItem.unit || "unit",
        photo: null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  // Update a single form field
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Get the first error message for a field
  const fieldError = (key) => errors[key]?.[0];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Build the API payload — skip empty optional fields
    const payload = { ...form };
    if (!payload.expiry) delete payload.expiry;
    if (!payload.value) delete payload.value;
    if (!payload.photo) delete payload.photo;

    try {
      if (editItem) {
        await productsAPI.update(editItem.id, payload);
        addToast("Product updated successfully");
      } else {
        await productsAPI.create(payload);
        addToast("Product added successfully");
      }
      onClose();
      onSaved();
    } catch (err) {
      // Show field-level errors if the API returns them
      if (err.data?.error && typeof err.data.error === "object") {
        setErrors(err.data.error);
      } else {
        addToast(err.message, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        {/* Modal header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {editItem ? "Edit Product" : "Add New Product"}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Product Name — full width */}
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Product Name *</label>
            <input
              required
              style={{
                ...styles.fieldInput,
                ...(fieldError("name") ? styles.fieldInputError : {}),
              }}
              placeholder="e.g. Amul Butter 500g"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {fieldError("name") && (
              <span style={styles.errorText}>{fieldError("name")}</span>
            )}
          </div>

          {/* Two-column grid for remaining fields */}
          <div style={styles.formGrid}>
            {/* Price */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Price (₹) *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                style={{
                  ...styles.fieldInput,
                  ...(fieldError("price") ? styles.fieldInputError : {}),
                }}
                placeholder="0.00"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
              {fieldError("price") && (
                <span style={styles.errorText}>{fieldError("price")}</span>
              )}
            </div>

            {/* Quantity */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Quantity *</label>
              <input
                required
                type="number"
                min="0"
                style={{
                  ...styles.fieldInput,
                  ...(fieldError("qty") ? styles.fieldInputError : {}),
                }}
                placeholder="0"
                value={form.qty}
                onChange={(e) => updateField("qty", e.target.value)}
              />
              {fieldError("qty") && (
                <span style={styles.errorText}>{fieldError("qty")}</span>
              )}
            </div>

            {/* Weight/Volume value */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Value (weight/volume)</label>
              <input
                type="number"
                min="0"
                step="any"
                style={styles.fieldInput}
                placeholder="e.g. 500"
                value={form.value}
                onChange={(e) => updateField("value", e.target.value)}
              />
            </div>

            {/* Unit */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Unit</label>
              <select
                style={styles.fieldInput}
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Expiry Date</label>
              <input
                type="date"
                style={styles.fieldInput}
                value={form.expiry}
                onChange={(e) => updateField("expiry", e.target.value)}
              />
            </div>

            {/* Photo Upload */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Product Photo</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => updateField("photo", e.target.files[0] || null)}
              />
              <button
                type="button"
                style={styles.fileButton}
                onClick={() => fileInputRef.current.click()}
              >
                {form.photo ? ` ${form.photo.name}` : " Choose Photo"}
              </button>
            </div>
          </div>

          {/* Submit / Cancel */}
          <div style={styles.modalFooter}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={saving}>
              {saving
                ? "Saving…"
                : editItem
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for viewing a product's QR code
function QRModal({ data, loading, onClose }) {
  if (!data) return null;

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...styles.modal, maxWidth: 360, textAlign: "center", padding: 28 }}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Product QR</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#7b8a99", marginBottom: 20 }}>
          {data.name}
        </p>

        {loading ? (
          <div style={{ padding: "40px 0", color: "#7b8a99", fontSize: 14 }}>
            Generating QR…
          </div>
        ) : data.url ? (
          <>
            <div style={styles.qrFrame}>
              <div style={styles.qrBorder}>
                <img
                  src={data.url}
                  alt="Product QR"
                  style={{ width: 200, height: 200, display: "block" }}
                />
              </div>
            </div>
            <a
              href={data.url}
              download
              style={styles.downloadLink}
              target="_blank"
              rel="noreferrer"
            >
              ⬇ Download QR
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* ── Main Products Page ────────────────────────────────────── */

export default function Products() {
  const { addToast } = useApp();

  // Page-level state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // QR modal state
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  /* ── Data fetching ── */

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Filtered list ── */

  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.product_number?.toLowerCase().includes(query) ||
      product.unit?.toLowerCase().includes(query)
    );
  });

  /* ── Event handlers ── */

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await productsAPI.delete(product.id);
      addToast("Product deleted", "error");
      fetchProducts();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleGetQR = async (product) => {
    setQrLoading(true);
    setQrData({ productId: product.id, name: product.name, url: null });

    try {
      const response = await productsAPI.getQR(product.id);
      const rawUrl = response.data?.product_qr || "";
      const fullUrl = rawUrl.startsWith("http") ? rawUrl : `${BASE_URL}${rawUrl}`;
      setQrData({ productId: product.id, name: product.name, url: fullUrl });
    } catch (err) {
      addToast(err.message, "error");
      setQrData(null);
    } finally {
      setQrLoading(false);
    }
  };

  /* ── Render ── */

  return (
    <div style={styles.page}>
      {/* ── Page Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Products</h1>
          <p style={styles.subtitle}>
            {loading
              ? "Loading…"
              : `${filteredProducts.length} of ${products.length} item(s)`}
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          + Add Product
        </button>
      </div>

      {/* ── API Error Banner ── */}
      {!loading && error && (
        <div style={styles.errorBanner}>
          <span>🔌</span>
          <div>
            <strong>API error</strong> — {error}
            <br />
            <small>
              Endpoint: <code>GET store/products/</code>
            </small>
          </div>
        </div>
      )}

      {/* ── Search & Refresh ── */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
        onRefresh={fetchProducts}
      />

      {/* ── Product Grid ── */}
      {loading ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>Loading...</div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          hasProducts={products.length > 0}
          onAdd={openCreateModal}
        />
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onQR={handleGetQR}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <ProductModal
        isOpen={modalOpen}
        editItem={editingProduct}
        onClose={closeModal}
        onSaved={fetchProducts}
        addToast={addToast}
      />

      {/* ── QR Code Modal ── */}
      <QRModal
        data={qrData}
        loading={qrLoading}
        onClose={() => setQrData(null)}
      />
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const styles = {
  // Page layout
  page: {
    padding: "26px 24px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 22,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 900,
    color: "#0d1f2d",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#7b8a99",
    marginTop: 3,
  },

  // Primary action button
  primaryButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #00b4a0, #00c9b0)",
    color: "#fff",
    border: "none",
    borderRadius: 11,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(0,180,160,.25)",
    transition: "all .2s",
  },

  // Error banner
  errorBanner: {
    display: "flex",
    gap: 12,
    background: "#fff8ec",
    border: "1.5px solid #fde68a",
    borderRadius: 12,
    padding: "13px 17px",
    marginBottom: 20,
    fontSize: 13,
    color: "#92400e",
    alignItems: "flex-start",
  },

  // Toolbar / search
  toolbar: {
    display: "flex",
    gap: 10,
    marginBottom: 22,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e8ecf2",
    borderRadius: 12,
    padding: "0 12px",
    gap: 8,
    flex: 1,
    minWidth: 240,
    transition: "border-color .2s, box-shadow .2s",
  },
  searchIcon: {
    color: "#9aacb8",
    fontSize: 15,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13,
    padding: "10px 0",
    flex: 1,
    color: "#0d1f2d",
    fontFamily: "inherit",
    background: "transparent",
  },
  clearButton: {
    border: "none",
    background: "transparent",
    color: "#9aacb8",
    cursor: "pointer",
    fontSize: 13,
    padding: "4px 2px",
  },
  refreshButton: {
    padding: "10px 16px",
    border: "1.5px solid #e8ecf2",
    borderRadius: 11,
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#3d4f5c",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .2s",
  },

  // Grid layout
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 18,
  },

  // Empty state
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#7b8a99",
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 13,
    color: "#9aacb8",
    marginBottom: 22,
    lineHeight: 1.7,
  },

  // Product card
  card: {
    background: "#fff",
    border: "1.5px solid #e8ecf2",
    borderRadius: 16,
    overflow: "hidden",
    transition: "transform .25s ease, box-shadow .25s ease",
    cursor: "default",
  },
  thumbnail: {
    height: 130,
    background: "linear-gradient(145deg, #e0fdf9 0%, #e8f4ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardContent: {
    padding: "14px 16px",
  },
  productName: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0d1f2d",
    marginBottom: 2,
  },
  productNumber: {
    fontSize: 11,
    color: "#9aacb8",
    fontFamily: "monospace",
    marginBottom: 10,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  priceTag: {
    fontSize: 19,
    fontWeight: 900,
    color: "#00b4a0",
  },
  unitBadge: {
    fontSize: 11.5,
    color: "#7b8a99",
    background: "#f4f6fb",
    padding: "3px 9px",
    borderRadius: 10,
    fontWeight: 600,
  },
  infoStrip: {
    display: "flex",
    gap: 14,
    background: "#f8fafb",
    borderRadius: 10,
    padding: "9px 12px",
    marginBottom: 12,
  },
  infoCell: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9aacb8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 600,
    color: "#3d4f5c",
  },

  // Card action buttons
  actionRow: {
    display: "flex",
    gap: 7,
  },
  qrButton: {
    flex: 1,
    padding: "8px",
    background: "#e8f4ff",
    border: "none",
    borderRadius: 9,
    fontSize: 11,
    fontWeight: 700,
    color: "#0074d0",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .18s",
  },
  editButton: {
    flex: 1,
    padding: "8px",
    background: "#e0fdf9",
    border: "none",
    borderRadius: 9,
    fontSize: 11,
    fontWeight: 700,
    color: "#00b4a0",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .18s",
  },
  deleteButton: {
    padding: "8px 11px",
    background: "#fee2e2",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .18s",
  },

  // Modal overlay & box
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 580,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 24px 64px rgba(0,0,0,.18)",
    animation: "fadeUp .25s ease forwards",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "22px 24px 0",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0d1f2d",
  },
  closeButton: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: "50%",
    background: "#f4f6fb",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s",
  },

  // Form layout
  form: {
    padding: "0 24px 24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 13,
    marginBottom: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#7b8a99",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    padding: "10px 13px",
    border: "1.5px solid #e8ecf2",
    borderRadius: 10,
    fontSize: 13,
    color: "#0d1f2d",
    outline: "none",
    fontFamily: "inherit",
    background: "#f8fafb",
    transition: "border-color .2s, box-shadow .2s",
  },
  fieldInputError: {
    borderColor: "#fca5a5",
  },
  errorText: {
    fontSize: 11.5,
    color: "#e53935",
    marginTop: 2,
  },
  fileButton: {
    padding: "10px 13px",
    border: "1.5px dashed #d0d8e4",
    borderRadius: 10,
    fontSize: 12,
    color: "#5a6a7a",
    cursor: "pointer",
    fontFamily: "inherit",
    background: "#f8fafb",
    textAlign: "left",
    transition: "border-color .2s",
  },

  // Modal footer
  modalFooter: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelButton: {
    padding: "10px 20px",
    border: "1.5px solid #e8ecf2",
    borderRadius: 10,
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#3d4f5c",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  },
  submitButton: {
    padding: "10px 22px",
    background: "linear-gradient(135deg, #00b4a0, #00c9b0)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(0,180,160,.2)",
    transition: "all .2s",
  },

  // QR modal extras
  qrFrame: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  qrBorder: {
    padding: 4,
    background: "linear-gradient(135deg, #00b4a0, #0074d0)",
    borderRadius: 14,
    display: "inline-block",
  },
  downloadLink: {
    display: "inline-block",
    padding: "10px 22px",
    background: "#e0fdf9",
    color: "#00b4a0",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    transition: "all .18s",
  },
};
