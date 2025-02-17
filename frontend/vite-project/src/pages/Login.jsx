import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom"; // Import Link from react-router-dom

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-500">
      <motion.div
        className="bg-white p-10 rounded-lg shadow-xl w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold mb-4 text-center text-indigo-600">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Link
            to="/register" // Link to the Register page
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
