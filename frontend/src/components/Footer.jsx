import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">

      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Logo + About */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="logo" className="h-10" />
          </div>
          <p className="text-sm leading-relaxed">
            Smart Shopping System designed to simplify your retail experience 
            with fast checkout, real-time billing, and seamless payments.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">Login</Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-white">Register</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <p className="text-sm">Email: support@s3.com</p>
          <p className="text-sm">Phone: +91 12345 67890</p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} S³. All rights reserved.
      </div>

    </footer>
  );
}