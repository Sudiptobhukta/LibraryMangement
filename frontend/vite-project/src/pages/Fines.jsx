import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Fines() {
  const [fines, setFines] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/fines", { headers: { Authorization: token } })
        .then((res) => setFines(res.data));
    }
  }, []);

  const payFine = (fineId) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:5000/fines/pay",
        { fine_id: fineId },
        { headers: { Authorization: token } }
      )
      .then(() => alert("Fine paid successfully!"))
      .catch((error) => alert("Error paying fine"));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Fines</h2>
      {fines.length === 0 ? (
        <p className="text-center text-gray-600">No pending fines</p>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => (
            <motion.div
              key={fine.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>Book ID: {fine.book_id} | Amount: ${fine.fine_amount}</p>
              <button
                onClick={() => payFine(fine.id)}
                className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
              >
                Pay Fine
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
