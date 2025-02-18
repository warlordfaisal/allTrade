const express = require('express');
const app = express();
const port = 3001; // Use a different port to avoid conflicts

app.get('/test-simple', (req, res) => {
  res.send('Hello from test-simple!');
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});