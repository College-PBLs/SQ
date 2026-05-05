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

  const deleteCart = (cartId) => {
  if (!window.confirm("Delete entire cart?")) return;

  fetch(`${BASE_URL}/user/cart/${cartId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed");

      fetchCart(); // refresh carts
    })
    .catch(() => alert("Server error"));
};

  const fetchOrders = () => {
  fetch(`${BASE_URL}/user/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => setOrders(data.data || []))
    .catch(console.error);
};

  // FETCH STORES
  useEffect(() => {
    fetch(`${BASE_URL}/active-stores/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStores(data.data || []))
      .catch(console.error);
  }, [token]);

  // FETCH CART
  const fetchCart = () => {
    fetch(`${BASE_URL}/user/carts/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCart(data.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // QR SCANNER 
  useEffect(() => {
    let scanner;

    if (view === "scan" ) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

      scanner.render(
        (decodedText) => {
          if (!decodedText?.trim()) return;
          setProductNumber(decodedText);



         fetch(`${BASE_URL}/user/cart-item/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_number: decodedText, qty: 1 }),
    })
    .then(() => fetchCart());

        },
        () => {}
      );
    }

    return () => {
      if (scanner) scanner.clear().catch(() => {});
    };
  }, [view]);

  // ADD TO CART
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

  // UPDATE QTY
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

  // REMOVE ITEM
  const removeItem = (id) => {
    fetch(`${BASE_URL}/user/cart-item/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then(fetchCart);
  };

  // PLACE ORDER
  const placeOrder = async (store_id) => {
    const res = await fetch(`${BASE_URL}/user/orders/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_id }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    const billRes = await fetch(
      `${BASE_URL}/user/order/${data.order_id}/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const billData = await billRes.json();
    setBill(billData.data || billData);
    setView("bill");

    fetchCart();
  };

  // FETCH ORDERS
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };


  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-white shadow p-4 flex justify-between">
         <img src={logo} alt="logo" className="h-10" />
        <div className="space-x-2">
          <button onClick={() => setView("stores")} className="btn">Stores</button>
          <button onClick={() => setView("cart")} className="btn">Cart</button>
          <button
  onClick={() => {
    fetchOrders();
    setView("orders");
  }}
  className="btn"
>
  Orders
</button>
          <button onClick={handleLogout} className="btn">Logout</button>
        </div>
      </div>

      <div className="p-4">

        {/* STORES */}
       {view === "stores" && (
  <>
    <div className="grid md:grid-cols-2 gap-4">
      {stores.map(store => (
        <div key={store.id} className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold text-lg">{store.store_name}</h2>
          <p className="text-gray-500">{store.city}</p>
        </div>
      ))}
    </div>

    {/* Separate section */}
    <div className="mt-6 text-center">
      <button
        onClick={() => setView("scan")}
        className="bg-teal-500 text-white px-6 py-3 rounded-lg font-semibold"
      >
        Start Scanning
      </button>
    </div>
  </>
)}

        {/* SCAN */}
        {view === "scan" && (
          <div className="bg-white p-4 rounded-xl shadow max-w-md mx-auto">
            <h2 className="font-bold text-xl mb-2">Scan Product</h2>

            <div id="reader" className="mb-4"></div>

            {/* <input
              value={productNumber}
              onChange={(e) => setProductNumber(e.target.value)}
              placeholder="Product number"
              className="border p-2 w-full rounded mb-2"
            />

            <button onClick={addToCart} className="w-full bg-teal-500 text-white p-2 rounded">
              Add to Cart
            </button> */}

            <button onClick={() => setView("cart")} className="w-full mt-2 bg-teal-300 p-2 rounded">
              Go to Cart
            </button>
          </div>
        )}

        {/* CART */}
        {view === "cart" && (
          <div>
            {cart.map(c => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow mb-4">
                <h2 className="font-bold">{c.store_detail.store_name}</h2>

                {c.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center mt-3">
                    <div>
                      <p>{item.product_detail.name}</p>
                      <p className="text-gray-500">₹{item.price_at_purchase}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 bg-teal-200">-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 bg-teal-200">+</button>
                      <button onClick={() => removeItem(item.id)} className="text-white bg-red-500 p-2 rounded-xl">Delete item</button>
                    </div>
                  </div>
                ))}

                <div className="flex">
                    <button
                  onClick={() => placeOrder(c.store || c.store_detail?.id)}
                  className="mt-4 mx-2 w-full bg-teal-500 text-white p-2 rounded"
                >
                  Place Order
                </button>
                <button onClick={() => deleteCart(c.id)}
                 className="mt-4 w-full bg-red-500 text-white p-2 rounded"
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
          <div className="bg-white p-4 rounded-xl shadow max-w-md mx-auto">
            <h2 className="font-bold text-xl">Bill</h2>

            {bill.items.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.product_detail.name} x {item.qty}</span>
                <span>₹{item.price_at_purchase}</span>
              </div>
            ))}

            <h3 className="font-bold mt-3">Total: ₹{bill.total_amount}</h3>

            <img
              src={`${BASE_URL}${bill.order_qr}`}
              className="mt-4 w-40 mx-auto"
            />

            <button onClick={() => setView("stores")} className="mt-4 w-full bg-gray-300 p-2 rounded">
              Back
            </button>
          </div>
        )}

        {/* ORDERS */}
        {view === "orders" && (
          <div>
            {orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow mb-3">
                <h3>{order.store_detail.store_name}</h3>
                <p>₹{order.total_amount}</p>

                <button
                  onClick={async () => {
                    const res = await fetch(
                      `${BASE_URL}/user/order/${order.id}/`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const data = await res.json();
                    setBill(data.data || data);
                    setView("bill");
                  }}
                  className="mt-2 bg-teal-500 text-white px-3 py-1 rounded"
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