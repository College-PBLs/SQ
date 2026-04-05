import { Link } from "react-router-dom";
import logo from "/src/assets/logo.jpeg";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
        
        
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 bg-white shadow-md">
        <img src={logo} alt="logo" className="h-10" />

        <div className="flex gap-2 sm:gap-4">
          <Link
            to="/login"
            className="px-3 py-2 text-sm sm:text-base bg-teal-500 text-white rounded-md"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 py-2 text-sm sm:text-base bg-teal-500 text-white rounded-md"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-4 py-10 sm:px-8 sm:py-16 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white">

        {/* Text */}
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
            Smart Shopping Simplified
          </h1>

          <p className="text-sm sm:text-lg mb-6 opacity-90">
            Skip long queues and shop smarter with S³. Scan items, generate bills instantly, and enjoy seamless checkout.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white text-teal-600 font-semibold rounded-lg"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-5 py-2.5 border border-white rounded-lg"
            >
              Login
            </Link>
          </div>

       
      </section>

      {/* About Section */}
      <section className="px-4 py-10 sm:px-10 sm:py-16 bg-gray-50 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
          About S³
        </h2>

        <p className="text-md sm:text-lg text-gray-600  max-w-2xl mx-auto">
          S³ is a smart shopping solution designed to eliminate waiting lines and improve customer experience. 
          With real-time scanning, automatic billing, and secure payments.
          S³ is a smart shopping solution designed to eliminate waiting lines and improve customer experience. 
          With real-time scanning, automatic billing, and secure payments.
            S³ is a smart shopping solution designed to eliminate waiting lines and improve customer experience. 
          With real-time scanning, automatic billing, and secure payments.
          S³ is a smart shopping solution designed to eliminate waiting lines and improve customer experience. 
          With real-time scanning, automatic billing, and secure payments.
        </p>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-center">
          How S<sup>3</sup> Works
        </h2>
        <div classname="">
          
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}