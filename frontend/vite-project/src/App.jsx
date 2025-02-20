import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import BookList from "./pages/Booklist";
import Membership from "./pages/Membership";
import Fines from "./pages/Fines";
import AdminDash from "./pages/AdminDash";
import Register from "./pages/Register"; 
import AddBook from "./pages/AddBook";
import UserDash from "./pages/UserDash";
import UpdateBook from "./pages/UpdateBook";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Add Register route */}
        <Route path="/books" element={<BookList />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/fines" element={<Fines />} />
        <Route path="/admin-dashboard" element={<AdminDash />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/dashboard" element={<UserDash />} />
        <Route path="/update-book/:id" element={<UpdateBook />} /> 
      </Routes>
    </Router>
  );
}

export default App;
