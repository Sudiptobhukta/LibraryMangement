import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipType, setMembershipType] = useState("6 months");
  const navigate = useNavigate();

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
      .post("http://localhost:5000/membership", { membership_type: membershipType }, { headers: { Authorization: token } })
      .then(() => {
        alert("Membership updated!");
        window.location.reload();
      })
      .catch((error) => alert("Error updating membership"));
  };

  const cancelMembership = () => {
    const token = localStorage.getItem("token");
    axios
    .post("http://localhost:5000/membership/cancel", {}, { headers: { Authorization: token } })

      .then(() => {
        alert("Membership canceled!");
        window.location.reload();
      })
      .catch((error) => alert("Error canceling membership"));
  };

  const goBack = () => {
    navigate(-1);
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
          <>
            <p className="text-center text-gray-800">Membership valid till: {membership.end_date}</p>
            <select
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setMembershipType(e.target.value)}
              value={membershipType}
            >
              <option value="6 months">Extend by 6 Months</option>
              <option value="1 year">Extend by 1 Year</option>
              <option value="2 years">Extend by 2 Years</option>
            </select>
            <button
              onClick={handleMembership}
              className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
            >
              Extend Membership
            </button>
            <button
              onClick={cancelMembership}
              className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 mt-4"
            >
              Cancel Membership
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-gray-800">No active membership</p>
            <select
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setMembershipType(e.target.value)}
              value={membershipType}
            >
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
            </select>
            <button
              onClick={handleMembership}
              className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
            >
              Buy Membership
            </button>
          </>
        )}

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
