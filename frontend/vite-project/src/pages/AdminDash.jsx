import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDash() {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fines, setFines] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/book", { headers: { Authorization: token } })
        .then((res) => setAvailableBooks(res.data))
        .catch(() => alert("Error fetching available books"));

      axios
        .get("http://localhost:5000/borrowedbook", { headers: { Authorization: token } })
        .then((res) => setBorrowedBooks(res.data))
        .catch(() => alert("Error fetching borrowed books"));

      axios
        .get("http://localhost:5000/fines", { headers: { Authorization: token } })
        .then((res) => setFines(res.data))
        .catch(() => alert("Error fetching fines"));

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decodedToken.role);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h2
        className="text-3xl font-semibold text-center text-indigo-600 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h2>

      {/* Add New Book Button */}
      {userRole === "admin" && (
        <div className="text-center mb-6">
          <Link
            to="/add-book"
            className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300"
          >
            Add New Book
          </Link>
        </div>
      )}

      {/* Available Books Section */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Available Books</h3>
        <div className="space-y-4">
          {availableBooks.map((book) => (
            <div key={book.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold">{book.title}</h4>
                <p className="text-gray-600">Author: {book.author}</p>
                <p className="text-gray-600">Serial No: {book.serial_no}</p>
              </div>
              {userRole === "admin" && (
                <button
                  onClick={() => navigate(`/update-book/${book.id}`)}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                >
                  Update
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Borrowed Books Section */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Borrowed Books</h3>
        <div className="space-y-4">
          {borrowedBooks.length === 0 ? (
            <p className="text-gray-600">No books currently borrowed.</p>
          ) : (
            borrowedBooks.map((book) => (
              <div key={book.id} className="border p-4 rounded">
                <h4 className="text-lg font-semibold">{book.title}</h4>
                <p className="text-gray-600">Author: {book.author}</p>
                <p className="text-gray-600">Issued: {new Date(book.issue_date).toLocaleDateString()}</p>
                <p className="text-gray-600">Return By: {new Date(book.return_date).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* User Fines Section */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">User Fines</h3>
        <div className="space-y-4">
          {fines.length === 0 ? (
            <p className="text-gray-600">No pending fines.</p>
          ) : (
            fines.map((fine) => (
              <div key={fine.id} className="border p-4 rounded">
                <p className="text-gray-600">Book ID: {fine.book_id}</p>
                <p className="text-gray-600">Fine Amount: ${fine.fine_amount}</p>
                <p className="text-gray-600">Status: {fine.paid ? "Paid" : "Pending"}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
