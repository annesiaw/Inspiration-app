const cron = require('node-cron');
const { generateDailyContent } = require('./claude');
const { sendDailyNotification } = require('./pushNotifications');

function startScheduler() {
  const hour = process.env.NOTIFY_HOUR || '8';
  const minute = process.env.NOTIFY_MINUTE || '0';

  const schedule = `${minute} ${hour} * * *`;
  console.log(`Scheduler started — daily notification at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`);

  cron.schedule(schedule, async () => {
    console.log(`[${new Date().toISOString()}] Running daily content job...`);
    try {
      const content = await generateDailyContent();
      await sendDailyNotification(content);
      console.log('Daily job complete.');
    } catch (err) {
      console.error('Daily job failed:', err);
    }
  });
}

module.exports = { startScheduler };
