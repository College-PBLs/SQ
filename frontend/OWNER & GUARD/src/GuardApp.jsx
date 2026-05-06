import { useCallback, useEffect, useState } from "react";
import OrderDetails from "./components/OrderDetails";
import QrScanner from "./components/QrScanner";
import {
  scanOrderByNumber,
  setAuthToken,
  getUserOrders,
} from "./services/api";

export default function GuardApp({ setRole }) {
  const [token] = useState(localStorage.getItem("token"));
  const [order, setOrder] = useState(null);
  const [scanError, setScanError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [allUserItems, setAllUserItems] = useState([]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const fetchOrder = useCallback(async (qrText) => {
    if (scanning) return;

    if (!qrText.startsWith("SQORD-")) {
      setScanError("Invalid QR");
      return;
    }

    setScanning(true);
    setScanError("");

    try {
      const result = await scanOrderByNumber(qrText);

      const normalizedOrder =
        result?.data?.order || result?.data || result;

      setOrder(normalizedOrder);
      setScannerActive(false);

      const userId = normalizedOrder.user.id;
      const userOrders = await getUserOrders(userId);
      const allItems = userOrders.flatMap(o => o.items || []);
      setAllUserItems(allItems);

    } catch (err) {
      setScanError("Failed to fetch order");
      setOrder(null);
    } finally {
      setScanning(false);
    }
  }, [scanning]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
  };

  return (
    <main className="p-4">
      <h1>Guard Panel</h1>

      <button onClick={logout}>Logout</button>

      <QrScanner
        active={scannerActive}
        scanning={scanning}
        onScanned={fetchOrder}
        onToggle={() => setScannerActive(prev => !prev)}
      />

      {scanError && <p>{scanError}</p>}

      <OrderDetails order={order} allUserItems={allUserItems} />
    </main>
  );
}