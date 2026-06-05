require('dotenv').config();
const oracledb = require('oracledb');

// Initialize Oracle Client for 11g (Thick Mode)
try {
  const clientOpts = process.env.ORACLE_CLIENT_PATH ? { libDir: process.env.ORACLE_CLIENT_PATH } : {};
  oracledb.initOracleClient(clientOpts);
  console.log('Oracle Client initialized for 11g compatibility');
} catch (err) {
  console.error('Failed to initialize Oracle Client:', err);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

module.exports = { oracledb, dbConfig };
