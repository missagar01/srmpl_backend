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
}

// Handle application exits cleanly
process.on('SIGINT', () => {
  cleanupTunnel();
  process.exit(0);
});
process.on('SIGTERM', () => {
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

    console.log(`[SSH Tunnel] Establishing tunnel to ${sshUser}@${sshHost}:${sshPort}...`);
    const sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('[SSH Tunnel] SSH connection successfully established');

      const server = net.createServer((socket) => {
        // Forward connection from local port through the SSH channel to the remote DB server
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

    sshClient.connect({
      host: sshHost,
      port: sshPort,
      username: sshUser,
      password: sshPassword
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

async function getConnection() {
  if (process.env.SSH_HOST) {
    // Make sure SSH Tunnel is created before returning connection
    await createSshTunnel();
  }
  const config = getDbConfig();
  return await oracledb.getConnection(config);
}

module.exports = {
  oracledb,
  getConnection,
  getDbConfig
};
