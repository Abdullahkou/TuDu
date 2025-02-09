const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./todo.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT UNIQUE, 
    email TEXT NOT NULL UNIQUE,  
    password TEXT NOT NULL
  )`);


  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY, 
    user_id INTEGER, 
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY, 
    user_id INTEGER, 
    text TEXT NOT NULL, 
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium', 
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, 
    due_date TIMESTAMP, 
    completed BOOLEAN DEFAULT FALSE
  )`);
});

module.exports = db;
