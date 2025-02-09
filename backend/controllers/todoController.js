const db = require("../config/db");

const TodoController = {
  getTodos: (req, res) => {
    db.all("SELECT * FROM todos WHERE user_id = ?", [req.user.id], (err, todos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(todos);
    });
  },

  createTodo: (req, res) => {
    const { text, priority, category_id, due_date, recurrence } = req.body;
    db.run(
      "INSERT INTO todos (user_id, text, priority, category_id, due_date, completed) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, text, priority, category_id || null, due_date, false],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, text, priority, category_id, due_date, recurrence });
      }
    );
  },

  deleteTodo: (req, res) => {
    db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "To-Do deleted" });
    });
  }
};

module.exports = TodoController;

