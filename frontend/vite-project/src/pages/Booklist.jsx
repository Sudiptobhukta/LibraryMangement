import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function BookList() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/books").then((res) => setBooks(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Available Books</h2>
      <div className="space-y-4">
        {books.map((book) => (
          <motion.div
            key={book.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-800">{book.title}</h3>
            <p className="text-gray-600">{book.author}</p>
            <p className={`text-sm mt-2 ${book.available ? 'text-green-500' : 'text-red-500'}`}>
              {book.available ? 'Available' : 'Not Available'}
            </p>
            <button
              className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-300"
              disabled={!book.available}
            >
              Borrow
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
