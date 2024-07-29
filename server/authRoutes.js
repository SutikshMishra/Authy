const router = require('express').Router();
const pool = require('./db');
const jwt = require('jsonwebtoken');

// User signup route
router.post('/signup', async (req, res) => {
  const { username, email, phoneNumber, password } = req.body;

  try {
    console.log('Signup request received:', req.body);
    const usernameCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "name" = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const emailCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "email" = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const phoneCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "phone" = $1', [phoneNumber]);
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const newUser = await pool.query(
      'INSERT INTO gkc_user_data("name", "email", "phone", "password") VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, phoneNumber, password]
    );

    console.log('New user created:', newUser.rows[0]);

    const loginDataQuery = `
      INSERT INTO user_login_data (id, username, email, login_count, last_login)
      VALUES ($1, $2, $3, $4, NOW());
    `;
    await pool.query(loginDataQuery, [newUser.rows[0].id, newUser.rows[0].name, newUser.rows[0].email, 1]);

    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET || "your_default_jwt_secret");
    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('Login request received:', req.body);
    const userQuery = 'SELECT * FROM gkc_user_data WHERE "name" = $1';
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your_default_jwt_secret", {
          expiresIn: '1h'
        });

        console.log('Login successful for user:', username);

        const updateLoginDataQuery = `
          UPDATE user_login_data
          SET login_count = login_count + 1, last_login = NOW()
          WHERE id = $1;
        `;
        await pool.query(updateLoginDataQuery, [user.id]);

        res.json({ token });
      } else {
        res.status(400).json({ error: 'Invalid Password' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;