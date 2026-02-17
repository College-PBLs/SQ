import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import logo from "../assets/logo.jpeg";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await loginUser(form);

    localStorage.setItem("access_token", res.data.access_token);

    if (res.status === 200) {
      alert("Login Successful");
    }

  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-10">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>

              <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                Login to Your Account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Submit
                </button>

                {/* Sign up link for mobile — matches Register page pattern */}
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

        {/* Right Side - Promotional (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 items-center justify-center p-8 relative overflow-hidden">
          <div className="text-center text-white z-10 max-w-md">
            <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">New Here?</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Sign up and enjoy our S<sup>3</sup>
            </p>
            <Link
              to="/register"
              className="inline-block px-12 py-4 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}