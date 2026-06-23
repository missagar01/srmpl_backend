const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
  host: process.env.AWS_PG_HOST,
  port: parseInt(process.env.AWS_PG_PORT || '5432', 10),
  user: process.env.AWS_PG_USER,
  password: process.env.AWS_PG_PASSWORD,
  database: process.env.AWS_PG_DATABASE,
};

// Check if SSL is enabled, which is standard for AWS RDS PostgreSQL
if (process.env.AWS_PG_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false // Allows self-signed certificates standard on AWS RDS
  };
}

const pool = new Pool(poolConfig);

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute a query on the PostgreSQL database
 * @param {string} text - SQL Query
 * @param {Array} params - Query Parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query
};
