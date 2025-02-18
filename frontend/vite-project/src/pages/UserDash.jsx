import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fines, setFines] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available books data when the component loads
    axios
      .get("http://localhost:5000/book", { headers: { Authorization: token } })
      .then((res) => {
        console.log("Books fetched:", res.data);
        setBooks(res.data);
      })
      .catch((error) => {
        console.log("Error fetching books:", error);
        alert("Failed to load books.");
      });

    // Fetch borrowed books data
    axios
      .get("http://localhost:5000/borrowed-books", { headers: { Authorization: token } })
      .then((res) => {
        console.log("Borrowed books fetched:", res.data);
        setBorrowedBooks(res.data); // Update state with borrowed books
      })
      .catch((error) => {
        console.log("Error fetching borrowed books:", error);
        alert("Failed to load borrowed books.");
      });

    // Fetch fines data
    axios
      .get("http://localhost:5000/fines", { headers: { Authorization: token } })
      .then((res) => {
        console.log("Fines fetched:", res.data);
        setFines(res.data); // Update state with fines
      })
      .catch((error) => {
        console.error("Error fetching fines:", error);
        alert("Failed to load fines.");
      });

    // Decode the JWT token to extract the user's role
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserRole(decodedToken.role); // Set user role
    }
  }, [token]);

  const borrowBook = (bookId) => {
    axios
      .post("http://localhost:5000/borrow", { book_id: bookId }, { headers: { Authorization: token } })
      .then(() => alert("Book borrowed successfully!"))
      .catch((error) => alert("Error borrowing book: " + error.response?.data?.message));
  };

 const returnBook = (bookId) => {
  axios
    .post("http://localhost:5000/return-book", { book_id: bookId }, { headers: { Authorization: token } })
    .then(() => {
      alert("Book returned successfully!");
      
      // Remove the returned book from borrowedBooks list
      setBorrowedBooks((prev) => prev.filter((book) => book.id !== bookId));
      
      // Fetch updated available books so the book reappears in the list
      axios
        .get("http://localhost:5000/book", { headers: { Authorization: token } })
        .then((res) => setBooks(res.data)) // Update available books list
        .catch((error) => console.error("Error fetching books after return:", error));
    })
    .catch((error) => alert("Error returning book: " + error.response?.data?.message));
};


  const logout = () => {
    localStorage.removeItem("token");
    navigate("/"); 
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h2
        className="text-4xl font-bold text-center text-indigo-700 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Library Dashboard
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Books Section */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Available Books</h3>
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold">{book.title}</h4>
                  <p className="text-gray-600">Author: {book.author}</p>
                </div>
                <button
                  className={`py-2 px-4 rounded ${book.available ? 'bg-green-500' : 'bg-gray-400'} text-white`}
                  onClick={() => borrowBook(book.id)}
                  disabled={!book.available}
                >
                  {book.available ? "Borrow" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Borrowed Books</h3>
          <div className="space-y-4">
            {borrowedBooks.length === 0 ? (
              <p className="text-gray-600">You have no borrowed books.</p>
            ) : (
              borrowedBooks.map((book) => (
                <div key={book.id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-semibold">{book.title}</h4>
                    <p className="text-gray-600">Author: {book.author}</p>
                  </div>
                  <span className="text-gray-600">Return by: {new Date(book.return_date).toLocaleDateString()}</span>
                  <button
                    className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                    onClick={() => returnBook(book.id)} // Return book
                  >
                    Return Book
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Fines Section */}
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Fines</h3>
          {fines.length === 0 ? (
            <p className="text-gray-600">No pending fines</p>
          ) : (
            fines.map((fine) => (
              <div key={fine.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <p>Book ID: {fine.book_id}</p>
                  <p>Fine Amount: ${fine.fine_amount}</p>
                </div>
                <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300">
                  Pay Fine
                </button>
              </div>
            ))
          )}
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/membership" className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 mx-2">
          Manage Membership
        </Link>
        <button
          onClick={logout}
          className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 mx-2 mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
