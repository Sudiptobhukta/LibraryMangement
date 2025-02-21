import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("book");
  const [serialNo, setSerialNo] = useState("");
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");

  const validateForm = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = "Book title is required.";
    if (!author.trim()) newErrors.author = "Author name is required.";
    if (!serialNo.trim()) newErrors.serialNo = "Serial number is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      await axios.post(
        "http://localhost:5000/books",
        { title, author, type, serial_no: serialNo },
        { headers: { Authorization: token } }
      );
      alert("Book added successfully!");
      setTitle("");
      setAuthor("");
      setType("book");
      setSerialNo("");
      setErrors({}); 
      window.location.reload();
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
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Add a Book
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Book Title"
              className={`w-full p-3 border rounded focus:ring-2 ${
                errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Author Name"
              className={`w-full p-3 border rounded focus:ring-2 ${
                errors.author ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              onChange={(e) => setAuthor(e.target.value)}
              value={author}
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
          </div>

          <div className="mb-4">
            <select
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setType(e.target.value)}
              value={type}
            >
              <option value="book">Book</option>
              <option value="movie">Movie</option>
            </select>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Serial Number"
              className={`w-full p-3 border rounded focus:ring-2 ${
                errors.serialNo ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              onChange={(e) => setSerialNo(e.target.value)}
              value={serialNo}
            />
            {errors.serialNo && <p className="text-red-500 text-sm mt-1">{errors.serialNo}</p>}
          </div>

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
