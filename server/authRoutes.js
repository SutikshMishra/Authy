const router = require('express').Router();
const pool = require('./db');
const jwt = require('jsonwebtoken');

// User signup route
router.post('/signup', async (req, res) => {
  const { username, email, phoneNumber, password } = req.body;

  try {
    // Check for existing username
    const usernameCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "Name" = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check for existing email
    const emailCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "Email" = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Check for existing phone number
    const phoneCheck = await pool.query('SELECT * FROM gkc_user_data WHERE "Phone" = $1', [phoneNumber]);
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO gkc_user_data("Name", "Email", "Phone", "Password") VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, phoneNumber, password]
    );

    // Insert login data
    const loginDataQuery = `
      INSERT INTO user_login_data (id, username, email, login_count, last_login)
      VALUES ($1, $2, $3, $4, NOW());
    `;
    await pool.query(loginDataQuery, [newUser.rows[0].Id, newUser.rows[0].Name, newUser.rows[0].Email, 1]);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.rows[0].Id }, process.env.JWT_SECRET || "your_default_jwt_secret");
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user by username
    const userQuery = 'SELECT * FROM gkc_user_data WHERE "Name" = $1';
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const storedPassword = user.Password;

      // Check password
      if (password === storedPassword) {
        // Generate JWT token
        const token = jwt.sign({ userId: user.Id }, process.env.JWT_SECRET || "your_default_jwt_secret", {
          expiresIn: '1h'
        });

        // Update login data
        const updateLoginDataQuery = `
          UPDATE user_login_data
          SET login_count = login_count + 1, last_login = NOW()
          WHERE id = $1;
        `;
        await pool.query(updateLoginDataQuery, [user.Id]);

        res.json({ token });
      } else {
        res.status(400).json({ error: 'Invalid Password' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
