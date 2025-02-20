import express from 'express'
import pg from 'pg'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

const port =5000;
const app = express()
dotenv.config()
const JWT_SECRET =  process.env.JWT_SECRET
const salt = bcrypt.genSaltSync()


app.use(cors())
app.use(express.json())

//database connection

const db = new pg.Client({
  user:'postgres',
  host: 'localhost',
  database:'libraryManagement',
  password:'123',
  port:5432
});
await db.connect()


const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// user register and login

app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(name,email,password,role)
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
  console.log(result)

    res.json({ message: 'User registered!', user: result.rows[0] }).status(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// books get and post

// Backend: GET /books
app.get('/book', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books WHERE available = true'); // Ensure you're checking availability here if needed
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/books', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const { title, author, type, serial_no } = req.body;
  console.log(title, author, type, serial_no)
  try {
    const result = await db.query(
      'INSERT INTO books (title, author, type, serial_no) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, type, serial_no]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//books borrowed

app.post('/borrow', auth, async (req, res) => {
  const { book_id } = req.body;
  console.log("Book ID received:", book_id);

  try {
    // Fetch book details and check if available
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1 AND available = true', [book_id]);
    const book = bookResult.rows[0];

    console.log("Fetched Book Data:", book);
    
    if (!book) return res.status(400).json({ message: 'Book not available' });

    const issueDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(issueDate.getDate() + 15); // 15 days return period

    // Insert into borrowed_books table
    await db.query(
      'INSERT INTO borrowed_books (user_id, book_id, issue_date, return_date, author, title,serial_no) VALUES ($1, $2, $3, $4, $5, $6,$7)',
      [req.user.userId, book_id, issueDate, returnDate, book.author, book.title,book.seri] // Corrected author field
    );

    // Mark the book as unavailable in books table
    await db.query('UPDATE books SET available = false WHERE id = $1', [book_id]);

    res.json({ message: 'Book borrowed successfully!' });
  } catch (error) {
    console.error("Error borrowing book:", error);
    res.status(500).json({ error: error.message });
  }
});



app.get("/membership", auth, async (req, res) => {
  try {
    const membership = await db.query(
      "SELECT * FROM memberships WHERE user_id = $1 ORDER BY end_date DESC LIMIT 1",
      [req.user.userId]
    );

    if (!membership.rows.length) {
      return res.json({ message: "No active membership", active: false });
    }

    res.json({ ...membership.rows[0], active: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or extend membership
app.post("/membership", auth, async (req, res) => {
  const { membership_type, action } = req.body;
  if (!["6 months", "1 year", "2 years"].includes(membership_type)) {
    return res.status(400).json({ message: "Invalid membership type" });
  }

  let months = membership_type === "6 months" ? 6 : membership_type === "1 year" ? 12 : 24;
  const today = new Date();

  try {
    const existingMembership = await db.query(
      "SELECT * FROM memberships WHERE user_id = $1 ORDER BY end_date DESC LIMIT 1",
      [req.user.userId]
    );

    if (existingMembership.rows.length && action === "extend") {
      // Extend membership
      let newEndDate = new Date(existingMembership.rows[0].end_date);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      await db.query(
        "UPDATE memberships SET end_date = $1 WHERE id = $2 RETURNING *",
        [newEndDate, existingMembership.rows[0].id]
      );
      return res.json({ message: "Membership extended successfully!" });
    } else {
      // New membership
      let endDate = new Date();
      endDate.setMonth(today.getMonth() + months);

      const result = await db.query(
        "INSERT INTO memberships (user_id, membership_type, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *",
        [req.user.userId, membership_type, today, endDate]
      );
      return res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel membership
app.post("/membership/cancel", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM memberships WHERE user_id = $1", [req.user.userId]);
    res.json({ message: "Membership canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fines

app.get('/fines', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT f.id, f.book_id, b.title, b.author, f.fine_amount, f.issue_date, f.return_date, f.fine_paid
      FROM fines f
      JOIN books b ON f.book_id = b.id
      WHERE f.user_id = $1`, 
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/fines/pay', auth, async (req, res) => {
  const { fine_id, fine_paid } = req.body;

  if (!fine_id) {
    return res.status(400).json({ message: 'Fine ID is required' });
  }

  try {
    await db.query(
      'UPDATE fines SET fine_paid = $1 WHERE id = $2 AND user_id = $3',
      [fine_paid, fine_id, req.user.userId]
    );

    res.json({ message: 'Fine paid successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//borrowed books
app.get('/borrowed-books', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM borrowed_books WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/borrowedbook', auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT b.id, b.title, b.author, bb.issue_date, bb.return_date FROM borrowed_books bb JOIN books b ON bb.book_id = b.id"
    );
    console.log(result)
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    res.status(500).json({ error: error.message });
  }
});



app.post('/return-book', auth, async (req, res) => {
  const { book_id, return_date } = req.body;

  if (!book_id) {
    return res.status(400).json({ message: 'Book ID is required' });
  }

  try {
    console.log("Returning Book ID:", book_id);

    // Get correct book_id from borrowed_books table
    const borrowedBookResult = await db.query(
      'SELECT book_id FROM borrowed_books WHERE id = $1 AND user_id = $2', 
      [book_id, req.user.userId]
    );

    if (borrowedBookResult.rows.length === 0) {
      return res.status(400).json({ message: 'Book not found in borrowed books' });
    }

    const correctBookId = borrowedBookResult.rows[0].book_id;

    // Mark the book as available
    await db.query('UPDATE books SET available = true WHERE id = $1', [correctBookId]);

    // Remove book from borrowed_books table
    await db.query('DELETE FROM borrowed_books WHERE book_id = $1 AND user_id = $2', 
      [correctBookId, req.user.userId]
    );

    // 🔹 **Call fine calculation function after return**
    await db.query('SELECT * FROM fines WHERE user_id = $1', [req.user.userId]);

    res.json({ message: `Book returned successfully!` });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({ error: error.message });
  }
});


app.put("/books/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;
  console.log(req.params)
  const { title, author, type, serial_no } = req.body;

  if (!title || !author || !serial_no) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await db.query(
      "UPDATE books SET title = $1, author = $2, type = $3, serial_no = $4 WHERE id = $5 RETURNING *",
      [title, author, type, serial_no, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated successfully!", book: result.rows[0] });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: error.message });
  }
});




app.listen(port, ()=>{
    console.log(`Server running on ${port}`)
})
