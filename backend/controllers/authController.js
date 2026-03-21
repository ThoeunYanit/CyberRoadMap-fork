const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length > 0) return res.status(409).json({ message: 'Email already registered' });

    const hashed = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Registration failed' });
        const token = jwt.sign(
          { id: result.insertId, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        res.status(201).json({ success: true, token, userId: result.insertId, username });
      });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid password' });

    // Update last_login AFTER user is found
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, userId: user.id, username: user.username, role: user.role });
  });
};