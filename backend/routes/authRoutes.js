const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const users = []; // Dies sollte durch eine Datenbank ersetzt werden

// Definieren Sie den JWT-Schlüssel direkt im Code
const JWT_SECRET = 'my_super_secret_key_12345';

// Registrierung
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  // Überprüfen, ob der Benutzer bereits existiert
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  // Passwort hashen
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Benutzer erstellen
  const newUser = { username, password: hashedPassword };
  users.push(newUser);

  // JWT erstellen
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Anmeldung
router.post('/login', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  // Benutzer suchen
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  // Passwort überprüfen
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  // JWT erstellen
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;