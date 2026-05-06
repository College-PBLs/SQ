import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 bg-white/70 backdrop-blur-sm border-b border-teal-100">
        
        <img src={logo} alt="Logo" className="h-16 object-contain" />
      
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-teal-700 border-2 border-teal-400 rounded-2xl text-sm font-semibold hover:bg-teal-500 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-white bg-teal-500 rounded-2xl text-sm font-semibold hover:bg-teal-700 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-6">
        <span className="text-md font-semibold tracking-wide">
          Smart Queue & Store System
        </span>

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight max-w-xl">
          Order Smarter.<br />
          <span className="bg-teal-500 bg-clip-text text-transparent">
            Queue Better.
          </span>
        </h1>

        <p className="text-gray-500 text-lg max-w-md leading-relaxed">
          Browse stores, manage your cart, and track orders — all in one seamless experience.
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-2">
          <Link to="/register"
            className="px-8 py-3.5 text-white bg-teal-500 rounded-xl font-bold text-base shadow-lg shadow-cyan-200 hover:bg-teal-700 transition-all"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 text-teal-700 bg-white border-2 border-teal-400 rounded-xl font-bold text-base hover:bg-teal-500 hover:text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full px-10 pb-12">
        {[
          {
            
            title: "Browse Stores",
            desc: "Discover active stores near you",
          },
          {
            title: "Manage Cart",
            desc: "Add products and checkout easily",
          },
          {
            
            title: "Track via QR",
            desc: "Scan QR codes to check your order",
          },
        ].map(({title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm"
          >
            <p className="font-bold text-gray-900 mb-1">{title}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}