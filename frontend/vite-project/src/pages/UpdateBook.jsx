import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateBook() {
  const { bookId } = useParams();
  const [book, setBook] = useState({ title: "", author: "", type: "book", serial_no: "" });
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const params =  useParams()
  console.log(params.id)

  useEffect(() => {
    if (!bookId || !token) return;

   
    axios
      .get(`http://localhost:5000/books/${params.id}`, { headers: { Authorization: token } })
      .then((res) => {
        if (!res.data) {
          alert("Book not found!");
          navigate("/admin-dashboard");
          return;
        }
        setBook(res.data);
      })
      .catch((error) => {
        alert("Error fetching book details: " + (error.response?.data?.message || error.message));
        navigate("/admin-dashboard");
      });

   
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decodedToken.role);

      // ✅ Redirect non-admins
      if (decodedToken.role !== "admin") {
        alert("Access denied! Only admins can update books.");
        navigate("/admin-dashboard");
      }
    } catch (error) {
      alert("Invalid token. Please log in again.");
      navigate("/");
    }
  }, [params.id, token, navigate]);

  
  const handleUpdate = (e) => {
    e.preventDefault();

    if (!book.title || !book.author || !book.serial_no) {
      alert("All fields are required!");
      return;
    }

    axios
      .put(`http://localhost:5000/books/${params.id}`, book, { headers: { Authorization: token } })
      .then(() => {
        alert("Book updated successfully!");
        navigate("/admin-dashboard");
      })
      .catch((error) =>
        alert("Error updating book: " + (error.response?.data?.message || error.message))
      );
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-8">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Update Book</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Book Title"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Author Name"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={book.author}
            onChange={(e) => setBook({ ...book, author: e.target.value })}
            required
             // ✅ Make author non-editable if required
          />
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={book.type}
            onChange={(e) => setBook({ ...book, type: e.target.value })}
          >
            <option value="book">Book</option>
            <option value="movie">Movie</option>
          </select>
          <input
            type="text"
            placeholder="Serial Number"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={book.serial_no}
            onChange={(e) => setBook({ ...book, serial_no: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
          >
            Update Book
          </button>
        </form>
      </motion.div>
    </div>
  );
}
