import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { stateCityMap } from "../utils/cityStateMap";
import logo from "../assets/logo.jpeg";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    state: "",
    city: "",
    pincode: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStateChange = (state) => {
    setForm({
      ...form,
      state,
      city: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    const { confirmPassword, ...payload } = form;

    try {

      setLoading(true);

      const res = await registerUser(payload);

      toast.success(res.message || "Successfully Registered");

      setForm({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        state: "",
        city: "",
        pincode: ""
      });

      navigate("/login");

    } catch (err) {

      toast.error(err.message || "Registration Failed");

      setForm(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex-1 flex">

        {/* Left Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 items-center justify-center p-8">

          <div className="text-center text-white max-w-md">

            <h2 className="text-5xl font-bold mb-6">
              Welcome Back!
            </h2>

            <p className="text-xl mb-8 opacity-90">
              To keep connected with us please login with your personal info
            </p>

            <Link
              to="/login"
              className="px-10 py-3 bg-white text-teal-600 rounded-full font-semibold hover:bg-gray-100"
            >
              Sign In
            </Link>

          </div>

        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">

          <div className="w-full max-w-md border-2 border-teal-500 rounded-2xl">

            <div className="bg-white rounded-2xl shadow-xl p-8">

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src={logo}
                  alt="logo"
                  className="h-16"
                />
              </div>

              <h1 className="text-3xl font-bold text-center mb-6">
                Create Account
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  name="full_name"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <input
                  name="address"
                  placeholder="Address"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                  value={form.address}
                  onChange={handleChange}
                  required
                />

               <div className="grid grid-cols-2 gap-3">

<select
  className="px-4 py-3 bg-gray-100 rounded-lg"
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
  className="px-4 py-3 bg-gray-100 rounded-lg"
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

</div>

                <input
                  name="pincode"
                  placeholder="Pincode"
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />

               <div className="grid grid-cols-2 gap-3">

<div className="relative">
<input
  type={showPassword ? "text" : "password"}
  placeholder="Password"
  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
  value={form.password}
  onChange={(e)=>setForm({...form,password:e.target.value})}
  required
/>

<button
  type="button"
  onClick={()=>setShowPassword(!showPassword)}
  className="absolute right-3 top-3 text-gray-500"
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</button>
</div>

<div className="relative">
<input
  type={showConfirmPassword ? "text" : "password"}
  placeholder="Confirm Password"
  className="w-full px-4 py-3 bg-gray-100 rounded-lg"
  value={form.confirmPassword}
  onChange={(e)=>setForm({...form,confirmPassword:e.target.value})}
  required
/>

<button
  type="button"
  onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
  className="absolute right-3 top-3 text-gray-500"
>
{showConfirmPassword ? <FaEyeSlash/> : <FaEye/>}
</button>
</div>

</div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600"
                >
                  {loading ? "Creating..." : "Sign Up"}
                </button>

                <p className="text-center text-gray-600 mt-4 lg:hidden">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-teal-600 font-semibold"
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