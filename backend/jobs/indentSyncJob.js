const cron = require('node-cron');
const { syncPendingIndents } = require('../services/indentSyncService');

let isRunning = false;
let lastRunAt = null;
let lastRunStatus = 'not run yet';
let consecutiveFailures = 0;

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
      consecutiveFailures = 0;
    } catch (err) {
      // This also catches errors syncPendingIndents itself failed to handle,
      // so an unexpected throw here can never crash the process.
      lastRunStatus = `error: ${err.message}`;
      consecutiveFailures += 1;
      console.error(`[indentSync] Run failed (${consecutiveFailures} in a row):`, err.message);
      // Every 10th consecutive failure, call out that this looks like a sustained
      // outage rather than a one-off blip - easy to miss buried in per-minute logs.
      // The job runs once a minute, so the count doubles as elapsed minutes.
      if (consecutiveFailures % 10 === 0) {
        console.error(`[indentSync] Still failing after ${consecutiveFailures} consecutive attempts (~${consecutiveFailures}m) - check SSH_HOST/DB connectivity.`);
      }
    } finally {
      isRunning = false;
      lastRunAt = startedAt;
    }
  });
  console.log('[indentSync] Scheduled to run every minute.');
};

const getStatus = () => ({ lastRunAt, lastRunStatus, isRunning, consecutiveFailures });

module.exports = { start, getStatus };
