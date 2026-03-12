import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { stateCityMap } from "../utils/cityStateMap";
import logo from "../assets/logo.jpeg";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: ""
  });

  const handleStateChange = (state) => {
    setForm({
      ...form,
      state,
      city: "" // reset city when state changes
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await registerUser(form);

    if (res.status === 201) {
      alert("Account Created Successfully");
    }

  } catch (err) {
    alert(err.message);
  }
};


  return (
      //   <div className="min-h-screen flex items-center justify-center px-4 py-8">
      // <div className="w-full max-w-5xl flex rounded-2xl overflow-hidden">


     <div className="min-h-screen flex flex-col">


    <div className="flex-1 flex">
        {/* Left Side - Promotional (reverse order on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 items-center justify-center p-8 relative overflow-hidden">
        
          <div className="text-center text-white z-10 max-w-md">
            <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">Welcome Back!</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              To keep connected with us please login with your personal info
            </p>
            <Link
              to="/login"
              className="inline-block px-12 py-4 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="w-full max-w-md  border-3 border-teal-500 rounded-2xl">
            
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
                Create Account
              </h1>
           
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Full Name"
                    className="col-span-2 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    className="col-span-2 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />

                  <input
                    placeholder="Phone Number"
                    className="col-span-2 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />

                  <input
                    placeholder="Address"
                    className="col-span-2 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                  />

                  <select
                    className="px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {Object.keys(stateCityMap).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    disabled={!form.state}
                    required
                  >
                    <option value="">Select City</option>
                    {form.state &&
                      stateCityMap[form.state].map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>

                  <input
                    placeholder="Pincode"
                    className="col-span-2 px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl mt-6"
                >
                  Sign Up
                </button>

                {/* Login link for mobile */}
<p className="text-center  text-gray-600 mt-4 lg:hidden">
  Already have an account?{" "}
  <Link
    to="/login"
    className="text-teal-600 font-semibold hover:underline"
  >
    Login
  </Link>
</p>




              </form>
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
}