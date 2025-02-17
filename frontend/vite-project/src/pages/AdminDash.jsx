import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

export default function AdminDash() {
  const [transactions, setTransactions] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fines, setFines] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    type: "book", // Default type is book
    serial_no: ""
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    // Fetch transactions, available books, borrowed books, and fines
    if (token) {
      axios
        .get("http://localhost:5000/transactions", { headers: { Authorization: token } })
        .then((res) => setTransactions(res.data))
        .catch((error) => alert("Error fetching transactions"));

      axios
        .get("http://localhost:5000/book", { headers: { Authorization: token } })
        .then((res) => setAvailableBooks(res.data))
        .catch((error) => alert("Error fetching available books"));

      axios
        .get("http://localhost:5000/borrowedbook", { headers: { Authorization: token } })
        .then((res) => setBorrowedBooks(res.data))
        .catch((error) => alert("Error fetching borrowed books"));

      axios
        .get("http://localhost:5000/fines", { headers: { Authorization: token } })
        .then((res) => setFines(res.data))
        .catch((error) => alert("Error fetching fines"));
    }
  }, [token]);

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.serial_no) {
      alert("All fields are required");
      return;
    }

    axios
      .post("http://localhost:5000/books", newBook, { headers: { Authorization: token } })
      .then(() => {
        alert("Book added successfully!");
        // Reset form
        setNewBook({ title: "", author: "", type: "book", serial_no: "" });
      })
      .catch((error) => alert("Error adding book: " + error.response?.data?.message));
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/"); // Navigate to login page
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

      {/* Add Book Section */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Add New Book</h3>
        <form onSubmit={handleAddBook}>
          <input
            type="text"
            placeholder="Book Title"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            required
          />
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={newBook.type}
            onChange={(e) => setNewBook({ ...newBook, type: e.target.value })}
          >
            <option value="book">Book</option>
            <option value="movie">Movie</option>
          </select>
          <input
            type="text"
            placeholder="Serial Number"
            className="w-full p-3 mb-6 border border-gray-300 rounded"
            value={newBook.serial_no}
            onChange={(e) => setNewBook({ ...newBook, serial_no: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add Book
          </button>
        </form>
      </motion.div>

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
            <div key={book.id} className="border p-4 rounded">
              <h4 className="text-lg font-semibold">{book.title}</h4>
              <p className="text-gray-600">Author: {book.author}</p>
              <p className="text-gray-600">Serial No: {book.serial_no}</p>
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
          {borrowedBooks.map((book) => (
            <div key={book.id} className="border p-4 rounded">
              <h4 className="text-lg font-semibold">{book.title}</h4>
              <p className="text-gray-600">Author: {book.author}</p>
              <p className="text-gray-600">Issued: {new Date(book.issue_date).toLocaleDateString()}</p>
              <p className="text-gray-600">Return By: {new Date(book.return_date).toLocaleDateString()}</p>
            </div>
          ))}
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
          {fines.map((fine) => (
            <div key={fine.id} className="border p-4 rounded">
              <p className="text-gray-600">Book ID: {fine.book_id}</p>
              <p className="text-gray-600">Fine Amount: ${fine.fine_amount}</p>
              <p className="text-gray-600">Status: {fine.paid ? "Paid" : "Pending"}</p>
            </div>
          ))}
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
