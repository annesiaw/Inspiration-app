const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const ARCHIVE_DIR = path.join(__dirname, '../data/archive');

function ensureDir() {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// GET /api/archive — list of available dates (newest first)
router.get('/', (req, res) => {
  ensureDir();
  try {
    const files = fs.readdirSync(ARCHIVE_DIR)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map(f => f.replace('.json', ''))
      .sort()
      .reverse();

    const list = files.map(date => ({
      date,
      dateFormatted: new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      })
    }));

    res.json({ success: true, count: list.length, dates: list });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Could not read archive.' });
  }
});

// GET /api/archive/:date — full content for one day
router.get('/:date', (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, error: 'Invalid date format.' });
  }
  const filePath = path.join(ARCHIVE_DIR, `${date}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'No content found for that date.' });
  }
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ success: true, date, ...content });
  } catch {
    res.status(500).json({ success: false, error: 'Could not read content.' });
  }
});

// Internal: called by scheduler to persist content
router.saveDay = function (date, content) {
  ensureDir();
  const filePath = path.join(ARCHIVE_DIR, `${date}.json`);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

  // Prune older than 30 days
  const files = fs.readdirSync(ARCHIVE_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (files.length > 30) {
    files.slice(0, files.length - 30).forEach(f =>
      fs.unlinkSync(path.join(ARCHIVE_DIR, f))
    );
  }
};

module.exports = router;
