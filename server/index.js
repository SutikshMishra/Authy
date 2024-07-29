const fs = require('fs');
const path = require('path');
const keys = require("./keys");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./authRoutes");
const { exec } = require("child_process");
const pgClient = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Function to execute SQL script
const executeSqlScript = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  try {
    await pgClient.query(sql);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Execute the SQL script to set up the database
executeSqlScript(path.join(__dirname, 'db.sql'));

// Get all user data
app.get("/gkc_user_data", async (req, res) => {
  try {
    const result = await pgClient.query("SELECT * FROM gkc_user_data");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to run mvn install and return jar file
app.post('/run-mvn-install', (req, res) => {
  const cwd = 'C:\\Users\\sutik\\IdeaProjects\\gkc-aws-pipeline';

  exec('mvn clean install', { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Failed to execute mvn install command');
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.sendFile('C:\\Users\\sutik\\IdeaProjects\\gkc-aws-pipeline\\target\\gkc-aws-pipeline-1.0-SNAPSHOT.jar');
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 5000; // Define 'port'
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});