-- Ensure gkc_user_data table exists
CREATE TABLE IF NOT EXISTS gkc_user_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  signup_time TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_login_data table exists
CREATE TABLE IF NOT EXISTS user_login_data (
  id INTEGER PRIMARY KEY REFERENCES gkc_user_data(id),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  login_count INTEGER DEFAULT 1,
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Sync the sequence
SELECT setval('gkc_user_data_id_seq', (SELECT MAX(id)
 FROM gkc_user_data));