import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">

        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin/>}/>

        </Routes>

      </div>
    </Router>
  );
}

export default App;