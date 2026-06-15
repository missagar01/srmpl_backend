const oracledb = require('oracledb');
require('dotenv').config();

async function run() {
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
  });

  const result = await conn.execute(`SELECT COLUMN_NAME, DATA_TYPE FROM ALL_TAB_COLUMNS WHERE TABLE_NAME = 'ORDER_BODY' AND COLUMN_NAME IN ('IRATE', 'IRATEI', 'DISCOUNT')`);
  console.log(result.rows);
  await conn.close();
}

run().catch(console.error);
