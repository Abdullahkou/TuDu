const db = require("../config/db");

const TodoModel = {
  create: (user_id, text, priority, category_id, due_date, recurrence, callback) => {
    db.run(
      `INSERT INTO todos (user_id, text, priority, category_id, due_date, completed) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, text, priority, category_id, due_date, false],
      function (err) {
        if (err) return callback(err);
        if (recurrence !== "none") {
          db.run(
            "INSERT INTO recurring_tasks (todo_id, recurrence) VALUES (?, ?)",
            [this.lastID, recurrence],
            (recErr) => callback(recErr, this.lastID)
          );
        } else {
          callback(null, this.lastID);
        }
      }
    );
  },

  getByUser: (user_id, callback) => {
    db.all("SELECT * FROM todos WHERE user_id = ?", [user_id], callback);
  },

  delete: (user_id, id, callback) => {
    db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [id, user_id], callback);
  }
};

module.exports = TodoModel;
