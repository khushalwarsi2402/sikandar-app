const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Simple CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/api/mutton', (req, res) => {
  res.json([
    { id: 1, name: 'Shoulder Chops', price: 420 },
    { id: 2, name: 'Leg Roast', price: 390 },
    { id: 3, name: 'Rib Cut', price: 480 }
  ]);
});

app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`));
