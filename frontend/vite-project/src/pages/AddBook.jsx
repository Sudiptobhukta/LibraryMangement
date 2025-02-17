// AddBook.js
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("book");
  const [serialNo, setSerialNo] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !serialNo) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/books", { title, author, type, serial_no: serialNo }, { headers: { Authorization: token } });
      alert("Book added successfully!");
      setTitle("");
      setAuthor("");
      setType("book");
      setSerialNo("");
    } catch (error) {
      alert(error.response?.data?.message || "Error adding book");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-8">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Add a Book</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Book Title"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            required
          />
          <input
            type="text"
            placeholder="Author Name"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setAuthor(e.target.value)}
            value={author}
            required
          />
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setType(e.target.value)}
            value={type}
          >
            <option value="book">Book</option>
            <option value="movie">Movie</option>
          </select>
          <input
            type="text"
            placeholder="Serial Number"
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSerialNo(e.target.value)}
            value={serialNo}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
          >
            Add Book
          </button>
        </form>
      </motion.div>
    </div>
  );
}
