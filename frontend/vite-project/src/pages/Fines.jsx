import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [finePaid, setFinePaid] = useState({});
  const [remarks, setRemarks] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/fines", { headers: { Authorization: token } })
      .then((res) => setFines(res.data))
      .catch((error) => console.error("Error fetching fines:", error));
  }, [token]);

  const handleFinePaidChange = (fineId) => {
    setFinePaid((prev) => ({ ...prev, [fineId]: !prev[fineId] }));
  };

  const handleConfirmPayment = (fineId, fineAmount) => {
    if (fineAmount > 0 && !finePaid[fineId]) {
      alert("Please mark the fine as paid before confirming.");
      return;
    }

    axios
      .post(
        "http://localhost:5000/fines/pay",
        { fine_id: fineId, fine_paid: fineAmount === 0 ? true : finePaid[fineId], remarks: remarks[fineId] || "" },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert("Fine processed successfully!");
        setFines((prev) => prev.filter((fine) => fine.id !== fineId)); // Remove paid fine from list
        navigate("/dashboard"); // Redirect to user dashboard
      })
      .catch((error) => alert("Error processing fine: " + error.response?.data?.message));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h2
        className="text-4xl font-bold text-center text-indigo-700 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Pay Fines
      </motion.h2>

      {fines.length === 0 ? (
        <p className="text-gray-600 text-center">No pending fines. You are all set! ✅</p>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => (
            <motion.div
              key={fine.id}
              className="bg-white p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg font-semibold text-gray-700">Book: {fine.title || "Unknown"}</p>
              <p className="text-gray-600">Fine Amount: ${fine.fine_amount}</p>
              <p className="text-gray-600">Issue Date: {new Date(fine.issue_date).toLocaleDateString()}</p>

              {/* Fine Paid Checkbox */}
              {fine.fine_amount > 0 && (
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={finePaid[fine.id] || false}
                    onChange={() => handleFinePaidChange(fine.id)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Mark as Fine Paid</span>
                </label>
              )}

              {/* Remarks Input */}
              <input
                type="text"
                placeholder="Remarks (Optional)"
                className="w-full p-2 mt-2 border border-gray-300 rounded"
                onChange={(e) => setRemarks({ ...remarks, [fine.id]: e.target.value })}
              />

              {/* Confirm Button */}
              <button
                className="w-full mt-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
                onClick={() => handleConfirmPayment(fine.id, fine.fine_amount)}
              >
                Confirm Payment
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
