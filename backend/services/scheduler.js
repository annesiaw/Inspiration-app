const cron = require('node-cron');
const { generateDailyContent } = require('./claude');
const { sendDailyNotification } = require('./pushNotifications');
const archiveRouter = require('../routes/archive');

function startScheduler() {
  const hour = process.env.NOTIFY_HOUR || '8';
  const minute = process.env.NOTIFY_MINUTE || '0';
  const schedule = `${minute} ${hour} * * *`;

  console.log(`Scheduler started — daily job at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Running daily content job...`);
    try {
      const content = await generateDailyContent();
      const today = new Date().toISOString().split('T')[0];

      // Persist to archive
      archiveRouter.saveDay(today, content);
      console.log(`Archived content for ${today}`);

      await sendDailyNotification(content);
      console.log('Daily job complete.');
    } catch (err) {
      console.error('Daily job failed:', err);
    }
  });
}

module.exports = { startScheduler };
