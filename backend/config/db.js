require('dotenv').config();
const oracledb = require('oracledb');
const net = require('net');
const { Client } = require('ssh2');

// Initialize Oracle Client for 11g (Thick Mode)
try {
  const clientOpts = process.env.ORACLE_CLIENT_PATH ? { libDir: process.env.ORACLE_CLIENT_PATH } : {};
  oracledb.initOracleClient(clientOpts);
  console.log('Oracle Client initialized for 11g compatibility');
} catch (err) {
  console.error('Failed to initialize Oracle Client:', err);
}

// If Oracle stops responding mid-call, fail after 30s instead of hanging
// forever (a hung call kept the indent-sync cron marked "running" indefinitely).
oracledb.callTimeout = 30000;

let activeTunnel = null;
let tunnelPromise = null;

function cleanupTunnel() {
  if (activeTunnel) {
    console.log('[DB] Closing SSH tunnel and local forwarding server...');
    if (activeTunnel.server) {
      try { activeTunnel.server.close(); } catch (e) {}
    }
    if (activeTunnel.sshClient) {
      try { activeTunnel.sshClient.end(); } catch (e) {}
    }
    activeTunnel = null;
    tunnelPromise = null;
  }
  // The tunnel is what every pooled connection rides on. Once it's gone, every
  // connection in both pools is dead - tear the pools down so the next
  // getConnection()/getJobConnection() rebuilds them over a fresh tunnel
  // instead of handing out sockets that will just throw.
  destroyPools('ssh tunnel closed');
}

// Handle application exits cleanly
process.on('SIGINT', async () => {
  await destroyPools('SIGINT');
  cleanupTunnel();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await destroyPools('SIGTERM');
  cleanupTunnel();
  process.exit(0);
});

function createSshTunnel() {
  if (tunnelPromise) return tunnelPromise;

  tunnelPromise = new Promise((resolve, reject) => {
    const sshHost = process.env.SSH_HOST;
    const sshPort = Number(process.env.SSH_PORT || 22);
    const sshUser = process.env.SSH_USER;
    const sshPassword = process.env.SSH_PASSWORD;
    const localPort = Number(process.env.LOCAL_ORACLE_PORT || 1522);

    // Extract remote destination host and port
    const dbConnStr = process.env.DB_CONNECTION_STRING;
    let remoteHost = '127.0.0.1';
    let remotePort = 1521;
    if (dbConnStr) {
      const match = dbConnStr.match(/^([^:/]+):(\d+)/);
      if (match) {
        remoteHost = match[1];
        remotePort = Number(match[2]);
      }
    }

    console.log('[SSH Tunnel] Establishing tunnel...');
    const sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('[SSH Tunnel] SSH connection successfully established');

      const server = net.createServer((socket) => {
        // Forward connection from local port through the SSH channel to the remote DB server
        socket.on('error', (sockErr) => {
          // Without this listener, a dropped/refused DB connection emits an
          // 'error' event with no handler, which crashes the whole Node process.
          console.error('[SSH Tunnel] Local socket error (DB likely unreachable):', sockErr.message);
        });

        sshClient.forwardOut(
          '127.0.0.1',
          socket.remotePort,
          remoteHost,
          remotePort,
          (err, stream) => {
            if (err) {
              console.error('[SSH Tunnel] ForwardOut error:', err.message);
              socket.end();
              return;
            }
            stream.on('error', (streamErr) => {
              console.error('[SSH Tunnel] Forwarded stream error (DB likely unreachable):', streamErr.message);
              socket.destroy();
            });
            socket.pipe(stream).pipe(socket);
          }
        );
      });

      server.listen(localPort, '127.0.0.1', () => {
        console.log(`[SSH Tunnel] Local server forwarding 127.0.0.1:${localPort} -> ${remoteHost}:${remotePort} via SSH`);
        activeTunnel = { sshClient, server };
        resolve(activeTunnel);
      });

      server.on('error', (err) => {
        console.error('[SSH Tunnel] Local server error:', err.message);
        cleanupTunnel();
        reject(err);
      });
    });

    sshClient.on('error', (err) => {
      console.error('[SSH Tunnel] SSH connection error:', err.message);
      cleanupTunnel();
      reject(err);
    });

    // If the SSH link drops later (network blip, DB host reboot), reset state
    // so the next getConnection() call re-establishes a fresh tunnel instead
    // of reusing a dead one forever.
    sshClient.on('close', () => {
      console.warn('[SSH Tunnel] SSH connection closed.');
      cleanupTunnel();
    });

    sshClient.connect({
      host: sshHost,
      port: sshPort,
      username: sshUser,
      password: sshPassword,
      readyTimeout: 20000
    });
  });

  return tunnelPromise;
}

const getDbConfig = () => {
  const isSsh = !!process.env.SSH_HOST;
  const user = isSsh ? process.env.ORACLE_USER : process.env.DB_USER;
  const password = isSsh ? process.env.ORACLE_PASSWORD : process.env.DB_PASSWORD;

  let connectString = isSsh ? process.env.ORACLE_CONNECTION_STRING : process.env.DB_CONNECTION_STRING;
  if (!connectString && process.env.ORACLE_HOST && process.env.LOCAL_ORACLE_PORT && process.env.ORACLE_SERVICE_NAME) {
    connectString = `${process.env.ORACLE_HOST}:${process.env.LOCAL_ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`;
  }
  if (!connectString) {
    connectString = '127.0.0.1:1522/ora11g';
  }

  return {
    user,
    password,
    connectString: connectString.replace(/,$/, '').trim()
  };
};

// ─── Connection pools ────────────────────────────────────────────────────────
// Two physically separate pools so the two workloads can never compete for the
// same connection slots:
//
//   HTTP_POOL  - every API request (order insert, chatbot). Sized for real
//                traffic; an order POST always draws from here.
//   JOB_POOL   - the once-a-minute indent-sync cron only. Capped at a single
//                connection, so no matter how long a sync takes it can consume
//                at most one server session and cannot touch HTTP_POOL.
//
// Result: an in-progress indent sync has zero effect on order-API latency or
// on a purchase order being created.

const HTTP_POOL = 'http';
const JOB_POOL = 'job';

const poolConfigs = {
  [HTTP_POOL]: {
    poolAlias: HTTP_POOL,
    poolMin: Number(process.env.DB_POOL_MIN || 2),
    poolMax: Number(process.env.DB_POOL_MAX || 10),
    poolIncrement: 1,
    poolTimeout: 120,          // secs an idle connection lingers before close
    queueTimeout: Number(process.env.DB_QUEUE_TIMEOUT_MS || 15000),
    queueMax: Number(process.env.DB_QUEUE_MAX || 50),
    pingInterval: 10,          // re-validate idle connections quickly after a blip
  },
  [JOB_POOL]: {
    poolAlias: JOB_POOL,
    poolMin: 0,
    poolMax: 1,
    poolIncrement: 1,
    poolTimeout: 30,
    queueTimeout: Number(process.env.DB_JOB_QUEUE_TIMEOUT_MS || 8000),
    queueMax: 4,
    pingInterval: 10,
  },
};

// One in-flight init promise per pool alias; cleared on failure/teardown so the
// next caller retries a clean build.
const poolInitPromises = {};

async function ensurePool(alias) {
  if (poolInitPromises[alias]) return poolInitPromises[alias];

  poolInitPromises[alias] = (async () => {
    if (process.env.SSH_HOST) {
      // Make sure the SSH tunnel is up before the pool dials the DB.
      await createSshTunnel();
    }

    // A pool for this alias may still be registered from a previous life
    // (e.g. tunnel dropped mid-request). Close it before recreating.
    try {
      const existing = oracledb.getPool(alias);
      if (existing) {
        try { await existing.close(0); } catch (e) {}
      }
    } catch (e) { /* no pool registered - fine */ }

    const config = getDbConfig();
    const pool = await oracledb.createPool({ ...config, ...poolConfigs[alias] });
    console.log(
      `[DB] Pool "${alias}" ready (min ${pool.poolMin}, max ${pool.poolMax}).`
    );
    return pool;
  })().catch((err) => {
    // Don't cache a rejected init - let the next call try again.
    poolInitPromises[alias] = null;
    throw err;
  });

  return poolInitPromises[alias];
}

async function destroyPools(reason) {
  const aliases = Object.keys(poolConfigs);
  for (const alias of aliases) {
    poolInitPromises[alias] = null;
    try {
      const pool = oracledb.getPool(alias);
      if (pool) {
        console.warn(`[DB] Tearing down pool "${alias}" (${reason}).`);
        try { await pool.close(0); } catch (e) {}
      }
    } catch (e) { /* nothing registered */ }
  }
}

async function getConnectionFromPool(alias) {
  await ensurePool(alias);
  try {
    return await oracledb.getConnection(alias);
  } catch (err) {
    // If the pool itself is broken (tunnel died, pool closed underneath us),
    // drop it so the retry rebuilds cleanly rather than hitting the same
    // dead pool again.
    const msg = String(err && err.message || '');
    if (/NJS-0(02|03|04|65)|pool is (closed|draining)|not (open|connected)/i.test(msg)) {
      await destroyPools(`getConnection failed on "${alias}": ${msg}`);
    }
    throw err;
  }
}

// Every HTTP request path uses this.
async function getConnection() {
  return getConnectionFromPool(HTTP_POOL);
}

// The indent-sync cron - and only the cron - uses this.
async function getJobConnection() {
  return getConnectionFromPool(JOB_POOL);
}

module.exports = {
  oracledb,
  getConnection,
  getJobConnection,
  getDbConfig,
  destroyPools,
};
