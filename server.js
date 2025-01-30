const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const port = 3000;

// Connect to SQLite database
const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

// Middleware to parse JSON bodies
app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
