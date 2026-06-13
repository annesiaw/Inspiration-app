require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contentRouter = require('./routes/content');
const tokensRouter = require('./routes/tokens');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/content', contentRouter);
app.use('/api/tokens', tokensRouter);

app.listen(PORT, () => {
  console.log(`Inspiration App backend running on port ${PORT}`);
  startScheduler();
});
