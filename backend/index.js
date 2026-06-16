require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contentRouter = require('./routes/content');
const tokensRouter = require('./routes/tokens');
const archiveRouter = require('./routes/archive');
const socialPostsRouter = require('./routes/socialPosts');
const { startScheduler } = require('./services/scheduler');
const { startSocialScheduler } = require('./services/socialScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/content', contentRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/archive', archiveRouter);
app.use('/api/social', socialPostsRouter);

app.listen(PORT, () => {
  console.log(`Inspiration App backend running on port ${PORT}`);
  startScheduler();
  startSocialScheduler();
});
