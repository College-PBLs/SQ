import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Customer() {
  const token = localStorage.getItem("access_token");

  const [stores, setStores] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("stores");
  const [selectedStore, setSelectedStore] = useState(null);
  const [productNumber, setProductNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [orders,setOrders] = useState([])

  // FETCH STORES
  useEffect(() => {
    fetch("http://127.0.0.1:8001/active-stores/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStores(data.data || []))
      .catch(err => console.error(err));
  }, [token]);

  // FETCH CART
  const fetchCart = () => {
    fetch("http://127.0.0.1:8001/user/carts/", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then(async (res) => {
    const data = await res.json();

    if (!res.ok) {
      console.error("Cart error:", data);
      return;
    }

    setCart(data.data || []);
  })
  .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // QR SCANNER (FIXED)
  useEffect(() => {
    let scanner;

    if (view === "scan") {
      if (!selectedStore) {
        alert("Please select a store first");
        setView("stores");
        return;
      }

      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText) => {
          if (!decodedText?.trim()) return;

          console.log("Scanned:", decodedText);

          setProductNumber(decodedText);
          addToCart(decodedText);

          scanner.clear();
        },
        () => {}
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [view]);

  // ADD TO CART
  const addToCart = (scannedValue = null) => {
    const finalProductNumber = scannedValue ?? productNumber;

    if (!selectedStore) {
      alert("Select a store first");
      return;
    }

    if (!finalProductNumber?.trim()) {
      alert("Scan or enter product number first");
      return;
    }

    fetch("http://127.0.0.1:8001/user/cart-item/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_number: finalProductNumber.trim(),
        qty: 1,
      }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Failed to add");
          return;
        }

        alert("Added to cart ");
        setProductNumber("");
        fetchCart();
      })
      .catch(() => {
        alert("Server error");
      });
  };


  const placeOrder = async (store_id) => {
  if (!store_id) {
    alert("Store ID missing ");
    return;
  }

  try {
    // STEP 1: PLACE ORDER
    const res = await fetch("http://127.0.0.1:8001/user/orders/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ store_id })
    });

    const data = await res.json();

    console.log("ORDER RESPONSE:", data);

    if (!res.ok) {
      alert(data.error || "Order failed ");
      return;
    }

    //  IMPORTANT
    const orderId = data.order_id;

    // STEP 2: FETCH BILL
    const billRes = await fetch(`http://127.0.0.1:8001/user/order/${orderId}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const billData = await billRes.json();

    console.log("FULL BILL:", billData);

    setBill(billData.data || billData);
    setView("bill");

    fetchCart();
    fetchOrders();

  } catch (err) {
    console.error(err);
    alert("Something went wrong ");
  }
};


const fetchOrders = () => {
  fetch("http://127.0.0.1:8001/user/orders/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      console.log("ORDERS:", data);
      setOrders(data.data || []);
    })
    .catch(err => console.error(err));
};


  return (
    <>
      {/* HEADER */}
      <header style={{ padding: 10, background: "#ddd" }}>
        <button onClick={() => setView("stores")}>Stores</button>
        <button onClick={() => setView("scan")}>Scan</button>
        <button onClick={() => setView("cart")}>Cart</button>
        <button onClick={() => {fetchOrders();setView("orders");}}>  Orders</button>
      </header>

      {/* STORES */}
      {view === "stores" && (
        <div>
          <h2>Active Stores</h2>

          {stores.map((store) => (
            <div key={store.id} style={{ border: "1px solid black", margin: 10, padding: 10 }}>
              <h3>{store.store_name}</h3>
              <p>{store.city}</p>

              <button
                onClick={() => {
                  setSelectedStore(store);
                  setView("scan");
                }}
              >
                Enter Store
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SCAN */}
      {view === "scan" && (
        <div>
          <h2>Scan Product</h2>

          {selectedStore && <h3>Store: {selectedStore.store_name}</h3>}

          <div id="reader" style={{ width: "300px", marginBottom: "20px" }} />

          <input
            type="text"
            placeholder="Enter product number"
            value={productNumber}
            onChange={(e) => setProductNumber(e.target.value)}
          />

          <button onClick={() => addToCart()}>Add to Cart</button>
        </div>
      )}

      {/* CART */}
      {view === "cart" && (
        <div>
          <h2>Your Cart</h2>

          {cart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            cart.map((c) => (
              <div key={c.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
                <h3>{c.store_detail.store_name}</h3>

                {c.items.map((item) => (
                  <div key={item.id}>
                    <p>{item.product_detail.name}</p>
                    <p>Qty: {item.qty}</p>
                    <p>₹{item.price_at_purchase || item.price}</p>
                  </div>
                ))}

                <button onClick={() => placeOrder(c.store || c.store_detail?.id)}>
                  Place Order
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* BILL */}
      {view === "bill" && bill && (
        <div>
          <h2>🧾 Order Bill</h2>

          <h3>Store: {bill.store_detail?.store_name}</h3>

          {bill?.items?.map((item) => (
            <div key={item.id}>
              <p>{item.product_detail.name}</p>
              <p>Qty: {item.qty}</p>
              <p>₹{item.price_at_purchase}</p>
            </div>
          ))}

          <h3>Total: ₹{bill.total_amount}</h3>

          <h4>Scan this QR at counter:</h4>
          <img
            src={`http://127.0.0.1:8001${bill.order_qr}`}
            alt="Order QR"
            width="200"
          />

          <br /><br />
          <button onClick={() => setView("stores")}>
            Back to Stores
          </button>
        </div>
      )}

      {view === "orders" && (
  <div>
    <h2>Your Orders</h2>

    {orders.length === 0 ? (
      <p>No previous orders</p>
    ) : (
      orders.map((order) => (
        <div key={order.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{order.store_detail?.store_name}</h3>
          <p>Total: ₹{order.total_amount}</p>

          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  `http://127.0.0.1:8001/user/order/${order.id}/`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const data = await res.json();

                setBill(data.data || data);
                setView("bill");
              } catch (err) {
                console.error(err);
                alert("Failed to load bill ❌");
              }
            }}
          >
            View Bill
          </button>
        </div>
      ))
    )}
  </div>
)}
    </>
  );
}