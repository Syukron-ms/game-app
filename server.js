// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'results.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Pastikan folder data dan file results.json ada
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

// === API ROUTES ===

// Ambil semua hasil
app.get('/api/results', (req, res) => {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(content || '[]');
    res.json(arr);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Simpan hasil baru
app.post('/api/results', (req, res) => {
  try {
    const entry = req.body;
    if (!entry || typeof entry !== 'object') {
      return res.status(400).json({ error: 'Invalid entry' });
    }

    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(content || '[]');
    arr.push(entry);

    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Hapus semua hasil
app.delete('/api/results', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// === FRONTEND (SERVE DIST) ===
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// ✅ Fix untuk Express v5 (SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// === START SERVER ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
