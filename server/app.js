require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Simple health endpoint
app.get('/api/ping', (req, res) => res.json({ ok: true, msg: 'pong' }));

// Serve static files from client when in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
