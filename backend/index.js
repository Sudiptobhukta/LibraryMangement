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
      'INSERT INTO borrowed_books (user_id, book_id, issue_date, return_date, author, title) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.userId, book_id, issueDate, returnDate, book.author, book.title] // Corrected author field
    );

    // Mark the book as unavailable in books table
    await db.query('UPDATE books SET available = false WHERE id = $1', [book_id]);

    res.json({ message: 'Book borrowed successfully!' });
  } catch (error) {
    console.error("Error borrowing book:", error);
    res.status(500).json({ error: error.message });
  }
});



//memeberships

app.get("/membership",auth,async(req,res)=>{
    try {
        const memebership = await db.oneOrNone("Select * from membership where user_id =$1",
        [req.user.userId]);

        if (memebership){
            return res.json({message:"no active membership", acitve: false});
        }
        res.json({...memebership,active :true});
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});

app.post('/membership', auth, async (req, res) => {
  const { membership_type } = req.body;
  let months = membership_type === '6 months' ? 6 : membership_type === '1 year' ? 12 : 24;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + months);

  try {
    const result = await db.query(
      'INSERT INTO memberships (user_id, membership_type, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, membership_type, startDate, endDate]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fines

app.get('/fines', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM fines WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows);
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
  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ message: 'Book ID is required' });
  }

  try {
    console.log("Returning Book ID:", book_id);

    // Check if the book exists in borrowed_books before updating
    const borrowedBookResult = await db.query('SELECT * FROM borrowed_books WHERE id = $1 AND user_id = $2', [book_id, req.user.userId]);

    if (borrowedBookResult.rows.length === 0) {
      return res.status(400).json({ message: 'Book not found in borrowed books' });
    }

    console.log("Borrowed Book Found:", borrowedBookResult.rows[0]);

    // Ensure book exists in books table
    // const bookCheck = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    // if (bookCheck.rows.length === 0) {
    //   return res.status(400).json({ message: 'Book does not exist in books table' });
    // }

    console.log("Updating book availability...");

    // Mark the book as available
    const updateResult = await db.query('UPDATE books SET available = true WHERE id = $1 RETURNING *', [book_id]);
    
    if (updateResult.rowCount === 0) {
      return res.status(500).json({ message: 'Failed to update book availability' });
    }

    console.log("Book updated:", updateResult.rows[0]);

    // Remove the book from borrowed_books table
    await db.query('DELETE FROM borrowed_books WHERE id = $1 AND user_id = $2', [book_id, req.user.userId]);

    res.json({ message: `Book "${borrowedBookResult.rows[0].title}" returned successfully!` });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({ error: error.message });
  }
});



app.listen(port, ()=>{
    console.log(`Server running on ${port}`)
})
