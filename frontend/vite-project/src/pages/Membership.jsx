import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

export default function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipType, setMembershipType] = useState("6 months");

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/membership", { headers: { Authorization: token } })
        .then((res) => setMembership(res.data));
    }
  }, []);

  const handleMembership = () => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:5000/membership",
        { membership_type: membershipType },
        { headers: { Authorization: token } }
      )
      .then(() => alert("Membership updated!"))
      .catch((error) => alert("Error updating membership"));
  };

  const goBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Membership</h2>
        {membership?.active ? (
          <p className="text-center text-gray-800">Membership valid till: {membership.end_date}</p>
        ) : (
          <p className="text-center text-gray-800">No active membership</p>
        )}
        <div className="mt-6">
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setMembershipType(e.target.value)}
          >
            <option value="6 months">6 Months</option>
            <option value="1 year">1 Year</option>
            <option value="2 years">2 Years</option>
          </select>
          <button
            onClick={handleMembership}
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
          >
            Purchase / Renew
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-4 text-center">
          <button
            onClick={goBack}
            className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
          >
            Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
