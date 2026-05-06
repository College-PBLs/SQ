import axios from 'axios';
export const BASE_URL = "http://192.168.1.98:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/auth/login/', { email, password });
  return response.data;
};

export const scanOrderByNumber = async (orderNumber) => {
  const response = await apiClient.post('/scan/order-qr/', {
    order_number: orderNumber,
  });
  return response.data;
};

export const getUserOrders = async (userId) => {
  const response = await apiClient.get(`/user/orders/${userId}`);
  return response.data;
};


function authHeaders() {
  const token = localStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json.message ||
      (typeof json.error === "string" ? json.error : null) ||
      json.exception_error ||
      (typeof json.error === "object" ? JSON.stringify(json.error) : null) ||
      res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

// Multipart upload (for endpoints with photo / logo / payment_qr files)
async function upload(method, path, formData) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method,
    headers: authHeaders(), // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json.message ||
      (typeof json.error === "string" ? json.error : null) ||
      json.exception_error ||
      res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    fd.append(k, v);
  });
  return fd;
}

// ── AUTH  (paths depend on your auth backend — adjust if needed) ──
export const authAPI = {
  // POST auth/login/  →  { token, user }  or  { key } (DRF)
  login: (email, password) =>
    request("POST", "auth/login/", { email, password }),

  // POST auth/register/  →  { token, user }
  register: (data) => request("POST", "auth/register/", data),

  // POST auth/logout/
  logout: () => request("POST", "auth/logout/"),
};

// ── PROFILE ──────────────────────────────────────────────────
export const profileAPI = {
  // GET profile/  →  { user, store? }
  get: () => request("GET", "profile/"),

  // PUT profile/
  update: (data) => {
    if (data.profile_photo instanceof File)
      return upload("PUT", "profile/", toFormData(data));
    return request("PUT", "profile/", data);
  },

  // DELETE profile/  →  { message }
  delete: () => request("DELETE", "profile/"),

  // POST profile/update-password/
  updatePassword: (old_password, new_password, confirm_password) =>
    request("POST", "profile/update-password/", {
      old_password,
      new_password,
      confirm_password,
    }),
};

// ── STORE (owner only) ────────────────────────────────────────
export const storeAPI = {
  // PUT store/update/  →  { message, data: StoreObject }
  update: (data) => {
    if (data.logo instanceof File || data.payment_qr instanceof File)
      return upload("PUT", "store/update/", toFormData(data));
    return request("PUT", "store/update/", data);
  },
};

// ── PRODUCTS (owner) ──────────────────────────────────────────
export const productsAPI = {
  // GET store/products/  →  { data: [ProductObject] }
  getAll: () => request("GET", "store/products/"),

  // GET store/get-product/<id>/  →  { data: ProductObject }
  getById: (id) => request("GET", `store/get-product/${id}/`),

  // POST store/products/
  // Required: name, price, qty   Optional: photo(File), expiry, value, unit
  create: (data) => {
    if (data.photo instanceof File)
      return upload("POST", "store/products/", toFormData(data));
    return request("POST", "store/products/", data);
  },

  // PUT store/product/<id>/
  update: (id, data) => {
    if (data.photo instanceof File)
      return upload("PUT", `store/product/${id}/`, toFormData(data));
    return request("PUT", `store/product/${id}/`, data);
  },

  // DELETE store/product/<id>/
  delete: (id) => request("DELETE", `store/product/${id}/`),

  // GET store/product/<id>/get-qr/  →  { data: { product_qr: "/media/..." } }
  getQR: (id) => request("GET", `store/product/${id}/get-qr/`),
};

// ── ORDERS (owner) ────────────────────────────────────────────
export const ordersAPI = {
  // GET store/orders/?start_date=&end_date=  →  { data: [OrderObject] }
  getAll: (startDate, endDate) => {
    const p = new URLSearchParams();
    if (startDate) p.set("start_date", startDate);
    if (endDate) p.set("end_date", endDate);
    const qs = p.toString();
    return request("GET", `store/orders/${qs ? "?" + qs : ""}`);
  },

  // GET store/order/<id>/  →  { data: OrderObject }
  getById: (id) => request("GET", `store/order/${id}/`),

  // DELETE store/order/<id>/
  delete: (id) => request("DELETE", `store/order/${id}/`),
};

// ── GUARDS (owner) ────────────────────────────────────────────
export const guardAPI = {
  // GET store/guards/  →  { data: [GuardObject] }
  getAll: () => request("GET", "store/guards/"),

  // GET store/guard/<id>/  →  { data: GuardObject }
  getById: (id) => request("GET", `store/guard/${id}/`),

  // POST store/guards/  →  { message }
  // Required: full_name, email, phone
  create: (full_name, email, phone) =>
    request("POST", "store/guards/", { full_name, email, phone }),

  // DELETE store/guard/<id>/  →  { message }
  remove: (id) => request("DELETE", `store/guard/${id}/`),
};
