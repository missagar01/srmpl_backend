const cron = require('node-cron');
const { syncPendingIndents } = require('../services/indentSyncService');

let isRunning = false;

const start = () => {
  cron.schedule('* * * * *', async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      await syncPendingIndents();
    } finally {
      isRunning = false;
    }
  });
  console.log('[indentSync] Scheduled to run every minute.');
};

module.exports = { start };
