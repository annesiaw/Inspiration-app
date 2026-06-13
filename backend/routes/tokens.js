const express = require('express');
const { registerToken, removeToken, getTokenCount } = require('../services/pushNotifications');

const router = express.Router();

router.post('/', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required.' });
  }
  try {
    registerToken(token);
    res.json({ success: true, message: 'Token registered.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:token', (req, res) => {
  removeToken(req.params.token);
  res.json({ success: true, message: 'Token removed.' });
});

router.get('/count', (req, res) => {
  res.json({ success: true, count: getTokenCount() });
});

module.exports = router;
