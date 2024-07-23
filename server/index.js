const keys = require("./keys");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./authRoutes")
//const authRoutes = require("authRoutes");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = require("./db");

pgClient.on("connect", client => {
  client
    .query("CREATE TABLE IF NOT EXISTS gkc_user_data (Id BIGINT PRIMARY KEY, Name VARCHAR(255), Email VARCHAR(255), Phone VARCHAR(20), Password VARCHAR(255), signup_time TIMESTAMPTZ)")
    .catch(err => console.log("PG ERROR", err));
});

app.get("/gkc_user_data", async (req, res) => {
  try {
    const result = await pgClient.query("SELECT * FROM gkc_user_data");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

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

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
