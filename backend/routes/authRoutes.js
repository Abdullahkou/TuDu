const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../config/db');

const JWT_SECRET = 'my_super_secret_key_12345';

// Registrierung
router.post('/register', [
  check('email', 'Email is required').isEmail(),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password } = req.body;

  // Überprüfen, ob der Benutzer bereits existiert
  db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
    if (err) {
      return res.status(500).json({ msg: 'Database error' });
    }
    if (row) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Benutzer erstellen
    db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], function(err) {
      if (err) {
        return res.status(500).json({ msg: 'Database error' });
      }

      // JWT erstellen
      const token = jwt.sign({ email, username }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    });
  });
});

// Anmeldung
router.post('/login', [
  check('email', 'Email is required').isEmail(),
  check('password', 'Password is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Benutzer suchen
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ msg: 'Database error' });
    }
    if (!row) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Passwort überprüfen
    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // JWT erstellen
    const token = jwt.sign({ email, username: row.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  });
});

module.exports = router;