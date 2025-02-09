const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Beispiel für eine geschützte Route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ msg: 'This is a protected route', user: req.user });
});

// Todos abrufen
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = (SELECT id FROM users WHERE email = ?)', [req.user.email], (err, rows) => {
    if (err) {
      return res.status(500).json({ msg: 'Database error' });
    }
    res.json(rows);
  });
});

// Todo hinzufügen
router.post('/', authMiddleware, (req, res) => {
  const { text } = req.body;
  db.run('INSERT INTO todos (user_id, text) VALUES ((SELECT id FROM users WHERE email = ?), ?)', [req.user.email, text], function(err) {
    if (err) {
      return res.status(500).json({ msg: 'Database error' });
    }
    res.json({ id: this.lastID, text });
  });
});

// Todo löschen
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)', [id, req.user.email], function(err) {
    if (err) {
      return res.status(500).json({ msg: 'Database error' });
    }
    res.json({ msg: 'Todo deleted' });
  });
});

module.exports = router;