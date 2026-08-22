const cron = require('node-cron');
const { syncPendingIndents } = require('../services/indentSyncService');

let isRunning = false;
let lastRunAt = null;
let lastRunStatus = 'not run yet';

const start = () => {
  cron.schedule('* * * * *', async () => {
    if (isRunning) {
      console.warn('[indentSync] Previous run still in progress, skipping this tick.');
      return;
    }
    isRunning = true;
    const startedAt = new Date();
    try {
      await syncPendingIndents();
      lastRunStatus = 'ok';
    } catch (err) {
      // syncPendingIndents already catches its own errors; this is a safety
      // net so an unexpected throw here can never crash the process.
      lastRunStatus = `error: ${err.message}`;
      console.error('[indentSync] Unexpected error in scheduled run:', err.message);
    } finally {
      isRunning = false;
      lastRunAt = startedAt;
    }
  });
  console.log('[indentSync] Scheduled to run every minute.');
};

const getStatus = () => ({ lastRunAt, lastRunStatus, isRunning });

module.exports = { start, getStatus };
