const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');  
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
}));
app.use(express.json());

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your MySQL username
    password: 'priyanka', // your MySQL password
    database: 'picshare'
});

// Connect to MySQL
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// Routes
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    db.query('SELECT id FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.json({ userId: results[0].id, userName: username }); // Return both userId and userName
        }

        // Insert the new user
        db.query('INSERT INTO users (username) VALUES (?)', [username], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ userId: result.insertId, userName: username }); // Return new userId and userName
        });
    });
});

// Fetch pictures for all users
app.get('/api/pictures/all', (req, res) => {
    const query = `
      SELECT pictures.id, pictures.url, pictures.title, pictures.created_at, users.username
      FROM pictures
      JOIN users ON pictures.user_id = users.id
      ORDER BY pictures.created_at DESC
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching pictures:", err);
        return res.status(500).json({ message: "Failed to fetch pictures." });
      }
      res.json({ pictures: results });
    });
  });

app.get('/api/pictures', (req, res) => {
    const { userId } = req.query;

    const query = `
      SELECT pictures.id, pictures.url, pictures.title, pictures.created_at, users.username 
      FROM pictures 
      JOIN users ON pictures.user_id = users.id 
      WHERE pictures.user_id = ? 
      ORDER BY pictures.created_at DESC
    `;
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching pictures:", err);
            return res.status(500).json({ message: "Failed to fetch pictures." });
        }
        res.json({ pictures: results });
    });
});

// Add a picture
app.post('/api/pictures', (req, res) => {
    const { url, title, userId } = req.body;
    db.query('INSERT INTO pictures (url, title, user_id) VALUES (?, ?, ?)', [url, title, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ pictureId: result.insertId });
    });
});

// Add a picture to favorites
app.post('/api/favorites', (req, res) => {
    const { userId, pictureId } = req.body;

    if (!userId || !pictureId) {
        return res.status(400).json({ error: 'userId and pictureId are required' });
    }

    db.query('INSERT INTO favorites (user_id, picture_id) VALUES (?, ?)', [userId, pictureId], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'An error occurred while adding to favorites' });
        }
        res.json({ message: 'Added to favorites' });
    });
});

  // DELETE route
  app.delete('/api/favorites', (req, res) => {
    const { userId, pictureId } = req.body;

    // Ensure that userId and pictureId are provided
    if (!userId || !pictureId) {
        return res.status(400).json({ error: 'userId and pictureId are required' });
    }

    // Add logic to remove from favorites (use SQL query here)
    db.query('DELETE FROM favorites WHERE user_id = ? AND picture_id = ?', [userId, pictureId], (err) => {
        if (err) {
            console.error('Error removing from favorites:', err);
            return res.status(500).json({ error: 'An error occurred while removing from favorites' });
        }
        res.json({ message: 'Removed from favorites' });
    });
});

// Fetch favorites of a specific user with username and creation date
app.get('/api/favorites/:userId', (req, res) => {
    const { userId } = req.params;
    db.query(
        `SELECT p.id, p.url, p.title, p.created_at, u.username
         FROM pictures p
         JOIN favorites f ON p.id = f.picture_id
         JOIN users u ON p.user_id = u.id
         WHERE f.user_id = ?
         ORDER BY f.id DESC`,
        [userId],
        (err, results) => {
            if (err) {
                console.error('Error fetching favorites:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        }
    );
});

// Start server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
