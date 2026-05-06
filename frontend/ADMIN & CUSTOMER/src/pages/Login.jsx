import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import logo from "../assets/logo.jpeg";

import Customer from "../pages/Customer";

import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const res = await loginUser(form);

      const { tokens, user, role } = res;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);

      toast.success("Login Successful");
      

      if (role === "admin") {
  navigate("/admin");
} if (role === "customer") {
  navigate("/customer");
} 
    } catch (err) {

      toast.error(err.message || "Login Failed");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex-1 flex">

        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="h-16 object-contain" />
              </div>

              <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Login to Your Account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5 mt-8">

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700"
                >
                  {loading ? "Logging in..." : "Submit"}
                </button>

                <p className="text-center text-gray-600 mt-4 lg:hidden">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>

              </form>

            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 items-center justify-center p-8">

          <div className="text-center text-white max-w-md">

            <h2 className="text-5xl font-bold mb-6">
              New Here?
            </h2>

            <p className="text-xl mb-8 opacity-90">
              Sign up and enjoy our S³
            </p>

            <Link
              to="/register"
              className="px-10 py-3 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100"
            >
              Sign Up
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}