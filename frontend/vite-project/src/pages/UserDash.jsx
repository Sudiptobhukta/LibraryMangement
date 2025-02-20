import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [fines, setFines] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookDetails, setSelectedBookDetails] = useState(null); // Store selected book details
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/book", { headers: { Authorization: token } })
      .then((res) => setBooks(res.data))
      .catch((error) => alert("Error fetching books: " + error.message));

    axios
      .get("http://localhost:5000/borrowed-books", { headers: { Authorization: token } })
      .then((res) => setBorrowedBooks(res.data))
      .catch((error) => alert("Error fetching borrowed books: " + error.message));

    axios
      .get("http://localhost:5000/fines", { headers: { Authorization: token } })
      .then((res) => setFines(res.data))
      .catch((error) => alert("Error fetching fines: " + error.message));
  }, [token]);

  const borrowBook = () => {
    if (!selectedBook) {
      alert("Please select a book to borrow.");
      return;
    }

    const bookToBorrow = books.find((book) => book.id === selectedBook);
    if (!bookToBorrow) {
      alert("Book not found.");
      return;
    }

    setSelectedBookDetails(bookToBorrow); // Store book details in state

    const today = new Date().toISOString().split("T")[0];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);
    const maxReturnDate = returnDate.toISOString().split("T")[0];

    let userReturnDate = maxReturnDate;

    let userSelectedReturnDate = prompt(`Enter a return date (YYYY-MM-DD) before ${maxReturnDate}:`, maxReturnDate);
    if (userSelectedReturnDate) {
      if (userSelectedReturnDate < today) {
        alert("Return date cannot be before today.");
        return;
      }
      if (userSelectedReturnDate > maxReturnDate) {
        alert(`Return date cannot be later than ${maxReturnDate}.`);
        return;
      }
      userReturnDate = userSelectedReturnDate;
    }

    axios
      .post(
        "http://localhost:5000/borrow",
        {
          book_id: selectedBook,
          issue_date: today,
          return_date: userReturnDate,
        },
        { headers: { Authorization: token } }
      )
      .then(() => {
        alert("Book borrowed successfully!");
        setSelectedBook(null);
        setSelectedBookDetails(null);

        axios.get("http://localhost:5000/book", { headers: { Authorization: token } }).then((res) => setBooks(res.data));
        axios.get("http://localhost:5000/borrowed-books", { headers: { Authorization: token } }).then((res) => setBorrowedBooks(res.data));
      })
      .catch((error) => alert("Error borrowing book: " + error.response?.data?.message));
  };

const returnBook = (bookId, returnDate) => {
  const bookToReturn = borrowedBooks.find((book) => book.book_id === bookId);
  if (!bookToReturn) {
    alert("Error: Book details not found.");
    return;
  }

  if (!returnDate) {
    alert("Please select a valid return date.");
    return;
  }

  axios
    .post(
      "http://localhost:5000/return-book",
      { book_id: bookToReturn.book_id, return_date: returnDate },
      { headers: { Authorization: token } }
    )
    .then(() => {
      alert("Book returned successfully!");

      // ✅ Remove returned book from borrowedBooks state immediately
      setBorrowedBooks((prev) => prev.filter((book) => book.book_id !== bookToReturn.book_id));

      // ✅ Fetch updated available books so returned book reappears
      axios.get("http://localhost:5000/book", { headers: { Authorization: token } })
        .then((res) => setBooks(res.data))
        .catch((error) => console.error("Error fetching books after return:", error));

      // ✅ Redirect to Pay Fine Page after return
      navigate("/fines");
    })
    .catch((error) => alert("Error returning book: " + error.response?.data?.message));
};


  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h2 className="text-4xl font-bold text-center text-indigo-700 mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Library Dashboard
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div className="bg-white p-6 rounded-lg shadow-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Available Books</h3>
          {selectedBookDetails && (
            <div className="bg-white p-4 rounded shadow-md mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Book Details</h3>
              <p><strong>Title:</strong> {selectedBookDetails.title}</p>
              <p><strong>Author:</strong> {selectedBookDetails.author}</p>
            </div>
          )}
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold">{book.title}</h4>
                  <p className="text-gray-600">Author: {book.author}</p>
                </div>
                <button className={`py-2 px-4 rounded ${book.available ? "bg-green-500" : "bg-gray-400"} text-white`} onClick={() => setSelectedBook(book.id)} disabled={!book.available}>
                  {book.available ? "Select" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>
          {selectedBook && <button onClick={borrowBook} className="mt-4 py-2 px-4 bg-indigo-600 text-white rounded">Borrow Selected Book</button>}
        </motion.div>

       {/* Borrowed Books Section */}
<motion.div className="bg-white p-6 rounded-lg shadow-lg">
  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Your Borrowed Books</h3>
  <div className="space-y-4">
    {borrowedBooks.length === 0 ? (
      <p className="text-gray-600">You have no borrowed books.</p>
    ) : (
      borrowedBooks.map((book) => (
        <div key={book.book_id} className="border p-4 rounded flex flex-col gap-2">
          <h4 className="text-lg font-semibold">{book.title}</h4>
          <p className="text-gray-600">Author: {book.author}</p>
          <p className="text-gray-600">Serial No: {book.serial_no}</p>
          <p className="text-gray-600">Issue Date: {new Date(book.issue_date).toLocaleDateString()}</p>
          
          {/* Return Date Field */}
          <label className="text-gray-600">
            Return Date:
            <input
              type="date"
              className="border border-gray-300 p-2 rounded ml-2"
              defaultValue={new Date(book.return_date).toISOString().split("T")[0]}
              min={new Date(book.issue_date).toISOString().split("T")[0]}
              max={new Date(book.issue_date).setDate(new Date(book.issue_date).getDate() + 15)}
              onChange={(e) => book.return_date = e.target.value}
            />
          </label>

          {/* Return Book Button */}
          <button
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
            onClick={() => returnBook(book.book_id, book.return_date)}
          >
            Return Book
          </button>
        </div>
      ))
    )}
  </div>
</motion.div>

      </div>

      <div className="mt-8 text-center">
        <Link to="/membership" className="py-2 px-4 bg-blue-600 text-white rounded">Manage Membership</Link>
        <button onClick={logout} className="py-2 px-4 bg-red-600 text-white rounded">Logout</button>
      </div>
    </div>
  );
}
