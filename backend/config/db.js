const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./todo.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT UNIQUE, 
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER, 
    name TEXT NOT NULL,
    color TEXT DEFAULT '#007aff',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER, 
    text TEXT NOT NULL, 
    priority TEXT DEFAULT 'Medium', 
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL, 
    due_date TIMESTAMP, 
    planned_date TIMESTAMP,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`ALTER TABLE groups ADD COLUMN color TEXT DEFAULT '#007aff'`, (err) => {
  });

  db.run(`ALTER TABLE todos ADD COLUMN completed_at TIMESTAMP`, (err) => {
  });

  db.run(`ALTER TABLE todos ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, (err) => {
  });
});

module.exports = db;
