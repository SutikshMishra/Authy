const { Pool } = require('pg');
const keys = require('./keys');

const pool = new Pool({
  // connectionString: keys.DATABASE_URL,
  connectionString: keys.dbURL,
  ssl: false // Disable SSL
});

module.exports = pool;