const axios = require('axios');
const { oracledb, getConnection } = require('../config/db');

/**
 * Indent items approved today, not yet pushed to the vendor portal.
 * CBP_REMARK is unused elsewhere in the ERP - repurposed here as the "already sent" marker.
 */
const getApprovedIndentsToday = async (connection) => {
  const sql = `
    SELECT
      ih.ENTITY_CODE   AS "entityCode",
      ih.DEPT_CODE     AS "deptCode",
      ib.APPROVEDBY    AS "userCode",
      um.USER_NAME     AS "userName",
      ib.VRNO          AS "indentNumber",
      ib.APPROVEDDATE  AS "approvedDate",
      ib.SLNO          AS "productSrno",
      ib.ITEM_CODE     AS "productId",
      NVL(im.SHORTNAME, im.ITEM_NAME) AS "productName",
      im.ITEM_NAME     AS "productSpecs",
      im.ITEM_SIZE     AS "productSize",
      ib.UM            AS "uom",
      mk.MAKE_NAME     AS "productBrand",
      ib.QTYINDENT     AS "quantity",
      ib.DIV_CODE      AS "divisionCode",
      ib.COST_CODE     AS "costCode",
      em.REGN_NO       AS "entityGst"
    FROM INDENT_BODY ib
    JOIN INDENT_HEAD ih ON ih.ENTITY_CODE = ib.ENTITY_CODE AND ih.VRNO = ib.VRNO
    LEFT JOIN ITEM_MAST im ON im.ITEM_CODE = ib.ITEM_CODE
    LEFT JOIN MAKE_MAST mk ON mk.MAKE_CODE = ib.MAKE_CODE
    LEFT JOIN USER_MAST um ON um.USER_CODE = ib.APPROVEDBY
    LEFT JOIN ENTITY_MAST em ON em.ENTITY_CODE = ih.ENTITY_CODE
    WHERE ib.APPROVEDBY IS NOT NULL
      AND TRUNC(ib.APPROVEDDATE) = TRUNC(SYSDATE)
      AND ib.CANCELLEDBY IS NULL
      AND ib.CBP_REMARK IS NULL
  `;
  const result = await connection.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
  return result.rows || [];
};

// Vendor API rejects special characters - strip anything but word chars, whitespace, and . , / ( ) - &
const cleanText = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim().replace(/[^\w\s.,\/()\-&]/g, '');
};

const buildProduct = (row) => ({
  indent_number: row.indentNumber || '',
  product_srno: row.productSrno ?? '',
  product_id: row.productId || '',
  product_name: cleanText(row.productName),
  product_specs: cleanText(row.productSpecs),
  product_size: cleanText(row.productSize),
  uom: cleanText(row.uom),
  product_brand: cleanText(row.productBrand),
  quantity: Number(row.quantity) || 0,
  division_code: row.divisionCode || '',
  dept_code: row.deptCode || '',
  cost_code: row.costCode || '',
  entity_code: row.entityCode || '',
  user_name: cleanText(row.userName),
  user_code: row.userCode || ''
});

const groupByEntity = (rows) => {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.entityCode)) {
      groups.set(row.entityCode, { entityGst: row.entityGst || '', rows: [] });
    }
    groups.get(row.entityCode).rows.push(row);
  }
  return groups;
};

const markAsSent = async (connection, rows) => {
  const sql = `
    UPDATE INDENT_BODY
    SET CBP_REMARK = 'SENT', CBPBY = 'AUTOSYNC', CBPDATE = SYSDATE
    WHERE ENTITY_CODE = :entityCode AND VRNO = :indentNumber AND SLNO = :productSrno
  `;
  for (const row of rows) {
    await connection.execute(sql, {
      entityCode: row.entityCode,
      indentNumber: row.indentNumber,
      productSrno: row.productSrno
    }, { autoCommit: false });
  }
  await connection.commit();
};

const syncPendingIndents = async () => {
  const apiUrl = process.env.INDENT_SYNC_API_URL;
  if (!apiUrl) {
    console.log('[indentSync] INDENT_SYNC_API_URL not set, skipping run.');
    return;
  }

  let connection;
  try {
    connection = await getConnection();

    const rows = await getApprovedIndentsToday(connection);
    if (rows.length === 0) {
      return;
    }

    console.log(`[indentSync] Found ${rows.length} approved indent item(s) to sync.`);

    const groups = groupByEntity(rows);

    for (const [entityCode, group] of groups) {
      const payload = {
        entity_gst: group.entityGst,
        products: group.rows.map(buildProduct)
      };

      try {
        const response = await axios.post(apiUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true
        });

        const success = response.status >= 200 && response.status < 300 && response.data?.status === true;

        if (success) {
          await markAsSent(connection, group.rows);
          const sentDetails = group.rows
            .map(row => `${row.indentNumber}/${row.productId} (approved ${row.approvedDate ? row.approvedDate.toISOString() : 'unknown'})`)
            .join(', ');
          console.log(`[indentSync] Sent ${group.rows.length} item(s) for entity ${entityCode}: ${sentDetails}`);
        } else {
          console.error(`[indentSync] API rejected entity ${entityCode}:`, response.status, JSON.stringify(response.data));
        }
      } catch (err) {
        console.error(`[indentSync] Failed to send entity ${entityCode}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[indentSync] Run failed:', err.message);
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = { syncPendingIndents };
