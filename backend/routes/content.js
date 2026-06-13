const express = require('express');
const { generateDailyContent } = require('../services/claude');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const content = await generateDailyContent();
    res.json({
      success: true,
      date: new Date().toISOString().split('T')[0],
      ...content
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate content.' });
  }
});

module.exports = router;
