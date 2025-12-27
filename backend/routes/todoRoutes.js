const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

router.get('/groups', authMiddleware, (req, res) => {
  db.all('SELECT * FROM groups WHERE user_id = (SELECT id FROM users WHERE username = ?)', [req.user.username], (err, rows) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.json(rows);
  });
});

router.post('/groups', authMiddleware, (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ msg: 'Name is required' });

  db.get('SELECT id FROM groups WHERE name = ? AND user_id = (SELECT id FROM users WHERE username = ?)',
    [name, req.user.username],
    (err, existing) => {
      if (err) return res.status(500).json({ msg: 'Database error' });
      if (existing) return res.status(400).json({ msg: 'Eine Liste mit diesem Namen existiert bereits' });

      db.run('INSERT INTO groups (user_id, name, color) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)',
        [req.user.username, name, color || '#007aff'],
        function (err) {
          if (err) return res.status(500).json({ msg: err.message });
          res.json({ id: this.lastID, name, color: color || '#007aff' });
        }
      );
    }
  );
});

router.put('/groups/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name); }
  if (color !== undefined) { updates.push('color = ?'); params.push(color); }

  if (updates.length === 0) return res.status(400).json({ msg: 'No fields to update' });

  params.push(id);
  params.push(req.user.username);

  const sql = `UPDATE groups SET ${updates.join(', ')} WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)`;

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ msg: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ msg: 'Group not found' });
    res.json({ msg: 'Group updated', id });
  });
});

router.delete('/groups/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM groups WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)', [id, req.user.username], function (err) {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.json({ msg: 'Group deleted' });
  });
});

router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = (SELECT id FROM users WHERE username = ?)', [req.user.username], (err, rows) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.json(rows);
  });
});

router.post('/', authMiddleware, (req, res) => {
  const { text, description, group_id, due_date, planned_date, priority } = req.body;

  db.run(
    'INSERT INTO todos (user_id, text, description, group_id, due_date, planned_date, priority) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, ?, ?, ?, ?)',
    [req.user.username, text, description || "", group_id || null, due_date || null, planned_date || null, priority || 'Medium'],
    function (err) {
      if (err) return res.status(500).json({ msg: err.message });
      res.json({ id: this.lastID, text, description, group_id, due_date, planned_date, priority: priority || 'Medium' });
    }
  );
});

router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { text, description, priority, group_id, due_date, planned_date, completed } = req.body;

  const updates = [];
  const params = [];

  if (text !== undefined) { updates.push('text = ?'); params.push(text); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (group_id !== undefined) { updates.push('group_id = ?'); params.push(group_id || null); }
  if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date || null); }
  if (planned_date !== undefined) { updates.push('planned_date = ?'); params.push(planned_date || null); }
  if (completed !== undefined) {
    updates.push('completed = ?');
    params.push(completed);
    if (completed) {
      updates.push('completed_at = ?');
      params.push(new Date().toISOString());
    } else {
      updates.push('completed_at = ?');
      params.push(null);
    }
  }

  if (updates.length === 0) return res.status(400).json({ msg: 'No fields to update' });

  params.push(id);
  params.push(req.user.username);

  const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)`;

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ msg: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ msg: 'Todo not found' });
    res.json({ msg: 'Todo updated', id, changes: req.body });
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)', [id, req.user.username], function (err) {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.json({ msg: 'Todo deleted' });
  });
});

module.exports = router;