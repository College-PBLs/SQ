import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import logo from "/src/assets/logo.jpeg";
import BASE_URL from '../config';
import { useNavigate } from "react-router-dom";

export default function Customer() {
  const token = localStorage.getItem("access_token");

  const [stores, setStores] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("stores");
  const [productNumber, setProductNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [orders, setOrders] = useState([]);


  const [loading, setLoading] = useState(false);

  const deleteCart = (cartId) => {
    if (!window.confirm("Delete entire cart?")) return;
    fetch(`${BASE_URL}/user/cart/${cartId}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) return alert(data.error || "Failed");
        fetchCart();
      })
      .catch(() => alert("Server error"));
  };

  const fetchOrders = () => {
    fetch(`${BASE_URL}/user/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setOrders(data.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetch(`${BASE_URL}/active-stores/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStores(data.data || []))
      .catch(console.error);
  }, [token]);

  const fetchCart = () => {
    fetch(`${BASE_URL}/user/carts/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCart(data.data || []))
      .catch(console.error);
  };

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    let scanner;
    let isScanning = true; 
    if (view === "scan") {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(
        (decodedText) => {
          if (!decodedText?.trim() || !isScanning) return;

          isScanning = false; 
          setProductNumber(decodedText);
          fetch(`${BASE_URL}/user/cart-item/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ product_number: decodedText, qty: 1 }),
          }).then(() => {
            fetchCart();
           setTimeout(() => {
            isScanning = true;
          }, 2000);
        }
        );
        },
        () => {}
      );
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [view]);

  const addToCart = () => {
    if (!productNumber.trim()) return alert("Enter product number");
    fetch(`${BASE_URL}/user/cart-item/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_number: productNumber, qty: 1 }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) return alert(data.error || "Failed");
        setProductNumber("");
        fetchCart();
      })
      .catch(() => alert("Server error"));
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    fetch(`${BASE_URL}/user/cart-item/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qty }),
    }).then(fetchCart);
  };

  const removeItem = (id) => {
    fetch(`${BASE_URL}/user/cart-item/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(fetchCart);
  };

  const placeOrder = async (store_id) => {
    setLoading(true);
    try{
    const res = await fetch(`${BASE_URL}/user/orders/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_id }),
    });
    const data = await res.json();
    if (!res.ok){
      setLoading(false);
      return alert(data.error);
    }

    const billRes = await fetch(`${BASE_URL}/user/order/${data.order_id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const billData = await billRes.json();
    setBill(billData.data || billData);
    setView("bill");
    fetchCart();
  }catch(err){
    alert("something went wrong");
  }
  setLoading(false); 
};

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const navItems = [
    { label: "Stores", key: "stores" },
    { label: "Cart", key: "cart", badge: cart.length > 0 ? cart.reduce((a, c) => a + c.items.length, 0) : null },
    { label: "Orders", key: "orders", action: fetchOrders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 bg-white/70 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-10">
        <img src={logo} alt="logo" className="h-16 object-contain" />
        <div className="flex gap-3 items-center">
          {navItems.map(({ label, key, action, badge }) => (
            <button
              key={key}
              onClick={() => { if (action) action(); setView(key); }}
              className={`relative px-5 py-2 rounded-2xl text-sm font-semibold border-2 transition-colors ${
                view === key
                  ? "bg-teal-500 text-white border-teal-500"
                  : "text-teal-700 border-teal-300 hover:bg-teal-500 hover:text-white"
              }`}
            >
              {label}
              {badge && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-2xl text-sm font-semibold border-2 border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 px-6 md:px-10 py-8">

        {/* STORES */}
        {view === "stores" && (
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Nearby Stores</h2>
              <p className="text-gray-500 text-sm mt-1">Browse active stores around you</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {stores.map(store => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-bold text-gray-900 mb-1">{store.store_name}</h3>
                  <p className="text-sm text-gray-500">{store.city}</p>
                  <span className="mt-3 inline-block text-xs bg-teal-100 text-teal-700 px-3 py-0.5 rounded-full font-semibold">Open</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setView("scan")}
                className="px-10 py-3.5 bg-teal-500 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all"
              >
                Start Scanning
              </button>
            </div>
          </div>
        )}

        {/* SCAN */}
        {view === "scan" && (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Scan Product</h2>
              <p className="text-gray-500 text-sm mt-1">Point your camera at a product QR code</p>
            </div>
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
              <div id="reader" className="rounded-xl overflow-hidden mb-4"></div>
              <button
                onClick={() => setView("cart")}
                className="w-full py-3 bg-teal-100 text-teal-700 rounded-xl font-semibold hover:bg-teal-500 hover:text-white transition-all"
              >
                Go to Cart
              </button>
            </div>
          </div>
        )}

        {/* CART */}
        {view === "cart" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Cart</h2>
              <p className="text-gray-500 text-sm mt-1">Review items before placing your order</p>
            </div>
            {cart.length === 0 && (
              <div className="bg-white rounded-2xl border border-teal-100 p-10 text-center text-gray-400 font-medium">
                Your cart is empty. Scan a product to add items!
              </div>
            )}
            {cart.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 mb-4">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">{c.store_detail.store_name}</h3>
                <div className="divide-y divide-teal-50">
                  {c.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.product_detail.name}</p>
                        <p className="text-xs text-teal-600 font-medium mt-0.5">₹{item.price_at_purchase}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center"
                        >-</button>
                        <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center"
                        >+</button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 px-3 py-1 text-xs rounded-lg bg-red-50 text-red-500 border border-red-200 font-semibold hover:bg-red-500 hover:text-white transition-all"
                        >Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => placeOrder(c.store || c.store_detail?.id)}
                    className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm shadow-teal-200"
                  >
                    Place Order
                  </button>
                  <button
                    onClick={() => deleteCart(c.id)}
                    className="px-5 py-3 bg-red-50 text-red-500 border border-red-200 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
                  >
                    Delete Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BILL */}
        {view === "bill" && bill && (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Bill</h2>
              <p className="text-gray-500 text-sm mt-1">Order confirmed!</p>
            </div>
            <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6">
              <div className="divide-y divide-teal-50 mb-4">
                {bill.items.map(item => (
                  <div key={item.id} className="flex justify-between py-3">
                    <span className="text-sm text-gray-700">{item.product_detail.name} × {item.qty}</span>
                    <span className="text-sm font-semibold text-gray-900">₹{item.price_at_purchase}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t-2 border-teal-100 pt-4 mb-5">
                <span className="font-extrabold text-gray-900 text-base">Total</span>
                <span className="font-extrabold text-teal-600 text-xl">₹{bill.total_amount}</span>
              </div>
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                  <img src={`${BASE_URL}${bill.order_qr}`} className="w-36 h-36 object-contain" alt="Order QR" />
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mb-4">Show this QR at the store counter</p>
              <button
                onClick={() => setView("stores")}
                className="w-full py-3 bg-teal-100 text-teal-700 rounded-xl font-semibold hover:bg-teal-500 hover:text-white transition-all"
              >
                Back to Stores
              </button>
            </div>
          </div>
        )}

        {loading && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
      <div className="w-6 h-6 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="font-semibold text-gray-700">Generating Bill...</span>
    </div>
  </div>
)}

        {/* ORDERS */}
        {view === "orders" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Orders</h2>
              <p className="text-gray-500 text-sm mt-1">Track your past purchases</p>
            </div>
            {orders.length === 0 && (
              <div className="bg-white rounded-2xl border border-teal-100 p-10 text-center text-gray-400 font-medium">
                No orders yet. Place your first order!
              </div>
            )}
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 mb-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-900">{order.store_detail.store_name}</h3>
                  <p className="text-teal-600 font-semibold mt-1">₹{order.total_amount}</p>
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch(`${BASE_URL}/user/order/${order.id}/`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    setBill(data.data || data);
                    setView("bill");
                  }}
                  className="px-5 py-2 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all"
                >
                  View Bill
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}