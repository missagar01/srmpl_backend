const { oracledb, getConnection } = require('../config/db');

const HEAD_COLUMN_MAP = new Map([
  ['entityCode', 'ENTITY_CODE'],
  ['tCode', 'TCODE'],
  ['vrNo', 'VRNO'],
  ['amendNo', 'AMENDNO'],
  ['vrDate', 'VRDATE'],
  ['amendDate', 'AMENDDATE'],
  ['tranType', 'TRANTYPE'],
  ['accCode', 'ACC_CODE'],
  ['subAccCode', 'SUB_ACC_CODE'],
  ['addonCode', 'ADDON_CODE'],
  ['staxCode', 'STAX_CODE'],
  ['etaxCode', 'ETAX_CODE'],
  ['paymentMode', 'PAYMENT_MODE'],
  ['paymentDueBasis', 'PAYMENT_DUE_BASIS'],
  ['paymentDueDays', 'PAYMENT_DUEDAYS'],
  ['validUptoDate', 'VALIDUPTO_DATE'],
  ['consigneeCode', 'CONSIGNEE_CODE'],
  ['brokerCode', 'BROKER_CODE'],
  ['freightBasis', 'FREIGHT_BASIS'],
  ['trptCode', 'TRPT_CODE'],
  ['fromPlace', 'FROM_PLACE'],
  ['toPlace', 'TO_PLACE'],
  ['truckType', 'TRUCKTYPE'],
  ['vehicleType', 'VEHICLE_TYPE'],
  ['deliveryToSlno', 'DELIVERY_TO_SLNO'],
  ['deliveryFromSlno', 'DELIVERY_FROM_SLNO'],
  ['billPassType', 'BILL_PASS_TYPE'],
  ['catalogFlag', 'CATALOG_FLAG'],
  ['partyRefNo', 'PARTYREFNO'],
  ['partyRefDate', 'PARTYREFDATE'],
  ['currencyCode', 'CURRENCY_CODE'],
  ['exchangeRate', 'EXCHANGE_RATE'],
  ['approvedBy', 'APPROVEDBY'],
  ['lastUpdate', 'LASTUPDATE'],
  ['consigneeAddressSlno', 'CONSIGNEE_ADDRESS_SLNO'],
  ['createdDate', 'CREATEDDATE'],
  ['userCode', 'USER_CODE'],
  ['createdBy', 'CREATEDBY'],
  ['partyAckRefNo', 'PARTY_ACK_REFNO'],
  ['orderPriceBasis', 'IRFIELD1'],
  ['order_price_basis', 'IRFIELD1'],
  ['orderPaymentTerm', 'PAYMENT_DUEDAYS'],
  ['order_payment_term', 'PAYMENT_DUEDAYS'],
  ['orderDeliveryPeriod', 'IRFIELD3'],
  ['order_delivery_period', 'IRFIELD3'],
  ['contactPerson', 'CONTACT_PERSON'],
  ['contact_person', 'CONTACT_PERSON'],
  ['contactDetail', 'CONTACT_DETAIL'],
  ['contact_detail', 'CONTACT_DETAIL'],
  ['contactEmail', 'CONTACT_EMAIL'],
  ['contact_email', 'CONTACT_EMAIL']
]);

const HEAD_INSERT_COLUMNS = new Set([
  'ENTITY_CODE',
  'TCODE',
  'VRNO',
  'AMENDNO',
  'VRDATE',
  'AMENDDATE',
  'TRANTYPE',
  'ACC_CODE',
  'SUB_ACC_CODE',
  'ADDON_CODE',
  'STAX_CODE',
  'ETAX_CODE',
  'PAYMENT_MODE',
  'PAYMENT_DUE_BASIS',
  'PAYMENT_DUEDAYS',
  'VALIDUPTO_DATE',
  'CONSIGNEE_CODE',
  'BROKER_CODE',
  'FREIGHT_BASIS',
  'TRPT_CODE',
  'FROM_PLACE',
  'TO_PLACE',
  'TRUCKTYPE',
  'VEHICLE_TYPE',
  'DELIVERY_TO_SLNO',
  'DELIVERY_FROM_SLNO',
  'BILL_PASS_TYPE',
  'CATALOG_FLAG',
  'PARTYREFNO',
  'PARTYREFDATE',
  'CURRENCY_CODE',
  'EXCHANGE_RATE',
  'IRFIELD1',
  'IRFIELD3',
  'IRFIELD4',
  'IRFIELD5',
  'IRFIELD6',
  'IRFIELD9',
  'IRFIELD10',
  'IRFIELD11',
  'IRFIELD14',
  'IRFIELD19',
  'CRAMT',
  'VALRECD',
  'AFCODE2',
  'AFCODE3',
  'AFCODE4',
  'AFCODE5',
  'AFCODE6',
  'AFCODE7',
  'AFCODE8',
  'AFCODE9',
  'AFCODE10',
  'AFCODE11',
  'AFCODE12',
  'AFCODE13',
  'AFCODE14',
  'AFCODE15',
  'AFCODE16',
  'AFCODE17',
  'AFCODE18',
  'AFRATE2',
  'AFRATE8',
  'AFRATE9',
  'AFRATEI2',
  'AFRATEI3',
  'AFRATEI4',
  'AFRATEI5',
  'AFRATEI6',
  'AFRATEI7',
  'AFRATEI8',
  'AFRATEI9',
  'AFRATEI10',
  'AFRATEI11',
  'AFRATEI12',
  'AFRATEI13',
  'AFRATEI14',
  'AFRATEI15',
  'AFRATEI16',
  'AFRATEI17',
  'AFRATEI18',
  'APPROVEDBY',
  'LASTUPDATE',
  'AFLOGIC2',
  'AFLOGIC3',
  'AFLOGIC4',
  'AFLOGIC5',
  'AFLOGIC8',
  'AFLOGIC9',
  'AFLOGIC10',
  'AFLOGIC16',
  'CONSIGNEE_ADDRESS_SLNO',
  'CREATEDDATE',
  'CREATEDBY',
  'USER_CODE',
  'PARTY_ACK_REFNO',
  'CONTACT_PERSON',
  'CONTACT_DETAIL',
  'CONTACT_EMAIL'
]);

const DATE_COLUMNS = new Set([
  'VRDATE',
  'AMENDDATE',
  'VALIDUPTO_DATE',
  'PARTYREFDATE',
  'LASTUPDATE',
  'CREATEDDATE'
]);

const BODY_COLUMN_MAP = new Map([
  ['entityCode', 'ENTITY_CODE'],
  ['tCode', 'TCODE'],
  ['vrNo', 'VRNO'],
  ['amendNo', 'AMENDNO'],
  ['amendDate', 'AMENDDATE'],
  ['slNo', 'SLNO'],
  ['divCode', 'DIV_CODE'],
  ['itemCode', 'ITEM_CODE'],
  ['um', 'UM'],
  ['qtyOrder', 'QTYORDER'],
  ['aum', 'AUM'],
  ['aqtyOrder', 'AQTYORDER'],
  ['rateUm', 'RATE_UM'],
  ['rate', 'RATE'],
  ['arate', 'ARATE'],
  ['fcRate', 'FC_RATE'],
  ['aumToUm', 'AUMTOUM'],
  ['indentTCode', 'INDENT_TCODE'],
  ['indentVrNo', 'INDENT_VRNO'],
  ['indentSlNo', 'INDENT_SLNO'],
  ['vrDate', 'VRDATE'],
  ['dueDate', 'DUEDATE'],
  ['stockType', 'STOCK_TYPE'],
  ['remark', 'REMARK'],
  ['irate', 'IRATE'],
  ['iratei', 'IRATEI'],
  ['taxRate', 'TAX_RATE'],
  ['taxAmount', 'TAX_AMOUNT'],
  ['taxOnAmount', 'TAX_ONAMOUNT'],
  ['cramt', 'CRAMT'],
  ['valrecd', 'VALRECD'],
  ['fromDate', 'FROM_DATE'],
  ['makeCode', 'MAKE_CODE'],
  ['costCode', 'COST_CODE'],
  ['deptCode', 'DEPT_CODE'],
  ['taxRate1', 'TAX_RATE1'],
  ['taxAmount1', 'TAX_AMOUNT1'],
  ['taxRate2', 'TAX_RATE2'],
  ['taxAmount2', 'TAX_AMOUNT2'],
  ['gstCode', 'GST_CODE'],
  ['orderTolerance', 'TOLERANCE_QTY'],
  ['order_tolerance', 'TOLERANCE_QTY'],
  ['toleranceBasis', 'TOLERANCE_BASIS'],
  ['tolerance_basis', 'TOLERANCE_BASIS']
]);

const BODY_INSERT_COLUMNS = new Set([
  'ENTITY_CODE',
  'TCODE',
  'VRNO',
  'AMENDNO',
  'AMENDDATE',
  'SLNO',
  'DIV_CODE',
  'ITEM_CODE',
  'REMARK',
  'UM',
  'QTYORDER',
  'AUM',
  'AQTYORDER',
  'RATE_UM',
  'RATE',
  'ARATE',
  'FC_RATE',
  'AUMTOUM',
  'IRATE',
  'IRATEI',
  'TAX_RATE',
  'TAX_AMOUNT',
  'TAX_ONAMOUNT',
  'CRAMT',
  'VALRECD',
  'FROM_DATE',
  'DUEDATE',
  'MAKE_CODE',
  'COST_CODE',
  'DEPT_CODE',
  'AFIELD1',
  'AFIELD2',
  'AFIELD3',
  'AFIELD4',
  'AFIELD5',
  'AFIELD6',
  'AFIELD7',
  'AFIELD8',
  'AFIELD9',
  'AFIELD10',
  'AFIELD11',
  'AFIELD12',
  'AFIELD13',
  'AFIELD14',
  'AFIELD15',
  'AFIELD16',
  'AFIELD17',
  'AFIELD18',
  'INDENT_TCODE',
  'INDENT_VRNO',
  'INDENT_SLNO',
  'VRDATE',
  'STOCK_TYPE',
  'TAX_RATE1',
  'TAX_AMOUNT1',
  'TAX_RATE2',
  'TAX_AMOUNT2',
  'GST_CODE',
  'TOLERANCE_QTY',
  'TOLERANCE_BASIS'
]);

const BODY_DATE_COLUMNS = new Set(['AMENDDATE', 'FROM_DATE', 'DUEDATE', 'VRDATE']);

const BODY_NUMBER_COLUMNS = new Set([
  'AMENDNO',
  'SLNO',
  'QTYORDER',
  'AQTYORDER',
  'RATE',
  'ARATE',
  'FC_RATE',
  'AUMTOUM',
  'IRATEI',
  'TAX_RATE',
  'TAX_AMOUNT',
  'TAX_ONAMOUNT',
  'CRAMT',
  'VALRECD',
  'TAX_RATE1',
  'TAX_AMOUNT1',
  'TAX_RATE2',
  'TAX_AMOUNT2',
  'AFIELD1',
  'AFIELD2',
  'AFIELD3',
  'AFIELD4',
  'AFIELD5',
  'AFIELD6',
  'AFIELD7',
  'AFIELD8',
  'AFIELD9',
  'AFIELD10',
  'AFIELD11',
  'AFIELD12',
  'AFIELD13',
  'AFIELD14',
  'AFIELD15',
  'AFIELD16',
  'AFIELD17',
  'AFIELD18',
  'TOLERANCE_QTY'
]);

const isBlank = (value) => (
  value === null
  || value === undefined
  || (typeof value === 'string' && value.trim() === '')
);

const cleanValue = (value) => (typeof value === 'string' ? value.trim() : value);

const getValue = (source, ...keys) => {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const val = Reflect.get(source, key);
      if (!isBlank(val)) return cleanValue(val);
    }
  }
  return undefined;
};

const excelSerialToDate = (serial) => {
  const utcMs = (Number(serial) - 25569) * 86400 * 1000;
  return new Date(utcMs);
};

const extractInt = (value) => {
  if (isBlank(value)) return 0;
  if (typeof value === 'number') return Math.floor(value);
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const toDbDate = (value) => {
  if (isBlank(value)) return undefined;

  if (value instanceof Date) return value;

  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value).trim())) {
    return excelSerialToDate(value);
  }

  const parsed = new Date(`${String(value).trim()}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    const err = new Error(`Invalid date value: ${value}`);
    err.statusCode = 400;
    err.type = 'VALIDATION_ERROR';
    throw err;
  }
  return parsed;
};

const toNumber = (value, fallback = 0) => {
  if (isBlank(value)) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const pairArrayToObject = (input) => {
  if (!Array.isArray(input)) return input;

  return input.reduce((result, pair) => {
    if (Array.isArray(pair) && pair.length >= 2) {
      const [rawKey, val] = pair;
      if (!isBlank(rawKey)) {
        const key = String(rawKey).trim();
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          Reflect.set(result, key, val);
        }
      }
    }
    return result;
  }, Object.create(null));
};

const normalizeHeader = (header, entityCode = 'SR') => {
  const normalized = Object.create(null);
  const headerObject = pairArrayToObject(header);

  for (const [key, value] of Object.entries(headerObject || {})) {
    if (isBlank(value)) continue;
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    const dbColumn = HEAD_COLUMN_MAP.get(key) || key.toUpperCase();
    if (HEAD_INSERT_COLUMNS.has(dbColumn)) {
      Reflect.set(normalized, dbColumn, cleanValue(value));
    }
  }

  Reflect.set(normalized, 'ENTITY_CODE', Reflect.get(normalized, 'ENTITY_CODE') || entityCode);
  Reflect.set(normalized, 'TCODE', Reflect.get(normalized, 'TCODE') || 'U');
  Reflect.set(normalized, 'AMENDNO', Reflect.get(normalized, 'AMENDNO') ?? 0);
  Reflect.set(normalized, 'TRANTYPE', Reflect.get(normalized, 'TRANTYPE') || 'PD');
  Reflect.set(normalized, 'AMENDDATE', Reflect.get(normalized, 'AMENDDATE') || Reflect.get(normalized, 'VRDATE'));
  Reflect.set(normalized, 'CURRENCY_CODE', Reflect.get(normalized, 'CURRENCY_CODE') || 'INR');
  Reflect.set(normalized, 'EXCHANGE_RATE', Reflect.get(normalized, 'EXCHANGE_RATE') ?? 1);
  Reflect.set(normalized, 'ADDON_CODE', 'PGST8');

  // Extract PAYMENT_DUEDAYS as integer from payload terms
  const rawPaymentDays = Reflect.get(normalized, 'PAYMENT_DUEDAYS') || getValue(headerObject, 'paymentDueDays', 'payment_due_days', 'orderPaymentTerm', 'order_payment_term');
  Reflect.set(normalized, 'PAYMENT_DUEDAYS', extractInt(rawPaymentDays));

  // Defaults for Freight Basis and Vehicle Type
  Reflect.set(normalized, 'FREIGHT_BASIS', Reflect.get(normalized, 'FREIGHT_BASIS') || 'NA');
  Reflect.set(normalized, 'VEHICLE_TYPE', Reflect.get(normalized, 'VEHICLE_TYPE') || 'U');

  // Defaults for IRFIELDs
  Reflect.set(normalized, 'IRFIELD4', Reflect.get(normalized, 'IRFIELD4') || '100% Payment will be paid within 15 days from the date of supply of mateRIAL');
  Reflect.set(normalized, 'IRFIELD5', Reflect.get(normalized, 'IRFIELD5') || 'If not paid in time please remind to our mail id: purchase@sagartmt.com');
  Reflect.set(normalized, 'IRFIELD6', Reflect.get(normalized, 'IRFIELD6') || 'Please send 1 copy of Test Certificate with supplied material to Transport , else he will not accept the material');
  Reflect.set(normalized, 'IRFIELD14', Reflect.get(normalized, 'IRFIELD14') || 'If any item found defective or does not match with the specs, will be replaced free of charge at our plan');
  Reflect.set(normalized, 'IRFIELD19', Reflect.get(normalized, 'IRFIELD19') || 'Please handover with proper packing, to avoid any transit damage, to our Representative, with 1 copy of this PO & your invoice');

  // AFCODE defaults
  Reflect.set(normalized, 'AFCODE2', Reflect.get(normalized, 'AFCODE2') || 'DI');
  Reflect.set(normalized, 'AFCODE3', Reflect.get(normalized, 'AFCODE3') || 'IN');
  Reflect.set(normalized, 'AFCODE4', Reflect.get(normalized, 'AFCODE4') || 'FRB');
  Reflect.set(normalized, 'AFCODE5', Reflect.get(normalized, 'AFCODE5') || 'PA');
  Reflect.set(normalized, 'AFCODE6', Reflect.get(normalized, 'AFCODE6') || 'O1');
  Reflect.set(normalized, 'AFCODE7', Reflect.get(normalized, 'AFCODE7') || 'DM');
  Reflect.set(normalized, 'AFCODE8', Reflect.get(normalized, 'AFCODE8') || 'SGST');
  Reflect.set(normalized, 'AFCODE9', Reflect.get(normalized, 'AFCODE9') || 'CGST');
  Reflect.set(normalized, 'AFCODE10', Reflect.get(normalized, 'AFCODE10') || 'IGST');
  Reflect.set(normalized, 'AFCODE11', Reflect.get(normalized, 'AFCODE11') || 'CESS');
  Reflect.set(normalized, 'AFCODE12', Reflect.get(normalized, 'AFCODE12') || 'FR');
  Reflect.set(normalized, 'AFCODE13', Reflect.get(normalized, 'AFCODE13') || 'O4');
  Reflect.set(normalized, 'AFCODE14', Reflect.get(normalized, 'AFCODE14') || 'DQ');
  Reflect.set(normalized, 'AFCODE15', Reflect.get(normalized, 'AFCODE15') || 'DO');
  Reflect.set(normalized, 'AFCODE16', Reflect.get(normalized, 'AFCODE16') || 'TC');
  Reflect.set(normalized, 'AFCODE17', Reflect.get(normalized, 'AFCODE17') || 'O3');
  Reflect.set(normalized, 'AFCODE18', Reflect.get(normalized, 'AFCODE18') || 'RO');

  // AFRATE defaults
  Reflect.set(normalized, 'AFRATE2', Reflect.get(normalized, 'AFRATE2') ?? 0);
  Reflect.set(normalized, 'AFRATE8', Reflect.get(normalized, 'AFRATE8') ?? 0);
  Reflect.set(normalized, 'AFRATE9', Reflect.get(normalized, 'AFRATE9') ?? 0);

  // AFRATEI defaults
  Reflect.set(normalized, 'AFRATEI2', Reflect.get(normalized, 'AFRATEI2') || 'L');
  Reflect.set(normalized, 'AFRATEI3', Reflect.get(normalized, 'AFRATEI3') || 'P');
  Reflect.set(normalized, 'AFRATEI4', Reflect.get(normalized, 'AFRATEI4') || 'R');
  Reflect.set(normalized, 'AFRATEI5', Reflect.get(normalized, 'AFRATEI5') || 'P');
  Reflect.set(normalized, 'AFRATEI6', Reflect.get(normalized, 'AFRATEI6') || 'L');
  Reflect.set(normalized, 'AFRATEI7', Reflect.get(normalized, 'AFRATEI7') || 'L');
  Reflect.set(normalized, 'AFRATEI8', Reflect.get(normalized, 'AFRATEI8') || 'P');
  Reflect.set(normalized, 'AFRATEI9', Reflect.get(normalized, 'AFRATEI9') || 'P');
  Reflect.set(normalized, 'AFRATEI10', Reflect.get(normalized, 'AFRATEI10') || 'P');
  Reflect.set(normalized, 'AFRATEI11', Reflect.get(normalized, 'AFRATEI11') || 'R');
  Reflect.set(normalized, 'AFRATEI12', Reflect.get(normalized, 'AFRATEI12') || 'L');
  Reflect.set(normalized, 'AFRATEI13', Reflect.get(normalized, 'AFRATEI13') || 'M');
  Reflect.set(normalized, 'AFRATEI14', Reflect.get(normalized, 'AFRATEI14') || 'L');
  Reflect.set(normalized, 'AFRATEI15', Reflect.get(normalized, 'AFRATEI15') || 'L');
  Reflect.set(normalized, 'AFRATEI16', Reflect.get(normalized, 'AFRATEI16') || 'Q');
  Reflect.set(normalized, 'AFRATEI17', Reflect.get(normalized, 'AFRATEI17') || 'L');
  Reflect.set(normalized, 'AFRATEI18', Reflect.get(normalized, 'AFRATEI18') || 'A');

  // AFLOGIC defaults
  Reflect.set(normalized, 'AFLOGIC2', Reflect.get(normalized, 'AFLOGIC2') ?? 1);
  Reflect.set(normalized, 'AFLOGIC3', Reflect.get(normalized, 'AFLOGIC3') ?? 1254);
  Reflect.set(normalized, 'AFLOGIC4', Reflect.get(normalized, 'AFLOGIC4') ?? 1);
  Reflect.set(normalized, 'AFLOGIC5', Reflect.get(normalized, 'AFLOGIC5') ?? 12);
  Reflect.set(normalized, 'AFLOGIC8', Reflect.get(normalized, 'AFLOGIC8') ?? 1234567);
  Reflect.set(normalized, 'AFLOGIC9', Reflect.get(normalized, 'AFLOGIC9') ?? 1234567);
  Reflect.set(normalized, 'AFLOGIC10', Reflect.get(normalized, 'AFLOGIC10') ?? 1234567);
  Reflect.set(normalized, 'AFLOGIC16', Reflect.get(normalized, 'AFLOGIC16') || '123456789ABCDEF');

  const userCode = getValue(headerObject, 'USER_CODE', 'userCode') || 'SR002';
  Reflect.set(normalized, 'USER_CODE', Reflect.get(normalized, 'USER_CODE') || userCode);

  const createdBy = getValue(headerObject, 'CREATEDBY', 'createdBy') || Reflect.get(normalized, 'USER_CODE');
  Reflect.set(normalized, 'CREATEDBY', createdBy);

  // Entity-specific consignee and delivery defaults
  let defaultConsignee = 'ZSO01';
  let defaultDeliveryTo = 50001;
  let defaultConsigneeAddress = 50001;

  if (entityCode === 'AL') {
    defaultConsignee = 'ZSO02';
    defaultDeliveryTo = 53258;
    defaultConsigneeAddress = 53258;
  } else if (entityCode === 'PA') {
    defaultConsignee = 'ZSO03';
    defaultDeliveryTo = 53259;
    defaultConsigneeAddress = 53259;
  }

  Reflect.set(normalized, 'CONSIGNEE_CODE', Reflect.get(normalized, 'CONSIGNEE_CODE') || defaultConsignee);
  Reflect.set(normalized, 'DELIVERY_TO_SLNO', Reflect.get(normalized, 'DELIVERY_TO_SLNO') || defaultDeliveryTo);
  Reflect.set(normalized, 'CONSIGNEE_ADDRESS_SLNO', Reflect.get(normalized, 'CONSIGNEE_ADDRESS_SLNO') || defaultConsigneeAddress);

  const gstNo = getValue(headerObject, 'gstNo', 'GSTIN', 'GSTINNO');
  let staxCode = 'GST2';
  if (gstNo && String(gstNo).trim().startsWith('22')) {
    staxCode = 'GST1';
  }
  Reflect.set(normalized, 'STAX_CODE', Reflect.get(normalized, 'STAX_CODE') || staxCode);

  for (const dateColumn of DATE_COLUMNS) {
    const dateVal = Reflect.get(normalized, dateColumn);
    if (!isBlank(dateVal)) {
      Reflect.set(normalized, dateColumn, toDbDate(dateVal));
    }
  }

  return normalized;
};

const normalizeBodyItem = (item, index, header, gstNo) => {
  const itemObject = pairArrayToObject(item);
  const normalized = Object.create(null);

  for (const [key, value] of Object.entries(itemObject || {})) {
    if (isBlank(value)) continue;
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

    const dbColumn = BODY_COLUMN_MAP.get(key) || key.toUpperCase();
    if (BODY_INSERT_COLUMNS.has(dbColumn)) {
      Reflect.set(normalized, dbColumn, cleanValue(value));
    }
  }

  Reflect.set(normalized, 'ENTITY_CODE', header.ENTITY_CODE);
  Reflect.set(normalized, 'TCODE', header.TCODE || 'U');
  Reflect.set(normalized, 'VRNO', header.VRNO);
  Reflect.set(normalized, 'AMENDNO', header.AMENDNO);
  Reflect.set(normalized, 'AMENDDATE', Reflect.get(normalized, 'AMENDDATE') || header.AMENDDATE || header.VRDATE);
  Reflect.set(normalized, 'VRDATE', Reflect.get(normalized, 'VRDATE') || header.VRDATE);
  Reflect.set(normalized, 'SLNO', Reflect.get(normalized, 'SLNO') || index + 1);
  let defaultDiv = 'CO';
  if (header.ENTITY_CODE === 'AL') {
    defaultDiv = 'C2';
  } else if (header.ENTITY_CODE === 'PA') {
    defaultDiv = 'C1';
  }
  Reflect.set(normalized, 'DIV_CODE', defaultDiv);
  const userUom = getValue(itemObject, 'um', 'uom', 'aum', 'rateUm', 'UM', 'AUM', 'RATE_UM') || 'NOS';
  Reflect.set(normalized, 'UM', userUom);
  Reflect.set(normalized, 'AUM', userUom);
  Reflect.set(normalized, 'RATE_UM', userUom);

  const userQty = toNumber(getValue(itemObject, 'qtyOrder', 'qtyorder', 'quantity', 'aqtyOrder', 'aqtyorder', 'QTYORDER', 'AQTYORDER'), 0);
  Reflect.set(normalized, 'QTYORDER', userQty);
  Reflect.set(normalized, 'AQTYORDER', userQty);

  const userRate = toNumber(getValue(itemObject, 'rate', 'arate', 'fcRate', 'fc_rate', 'RATE', 'ARATE', 'FC_RATE'), 0);
  Reflect.set(normalized, 'RATE', userRate);
  Reflect.set(normalized, 'ARATE', userRate);
  Reflect.set(normalized, 'FC_RATE', userRate);
  Reflect.set(normalized, 'AUMTOUM', Reflect.get(normalized, 'AUMTOUM') ?? 1);
  Reflect.set(normalized, 'INDENT_TCODE', Reflect.get(normalized, 'INDENT_TCODE') || 'I');
  const userIndentSlNo = toNumber(getValue(itemObject, 'indentSlNo', 'INDENT_SLNO', 'indent_slno'), 0);
  Reflect.set(normalized, 'INDENT_SLNO', userIndentSlNo || Reflect.get(normalized, 'SLNO'));
  Reflect.set(normalized, 'DUEDATE', Reflect.get(normalized, 'DUEDATE') || Reflect.get(normalized, 'VRDATE'));
  Reflect.set(normalized, 'STOCK_TYPE', Reflect.get(normalized, 'STOCK_TYPE') || 'R');

  // Parse numbers
  for (const numColumn of BODY_NUMBER_COLUMNS) {
    const numVal = Reflect.get(normalized, numColumn);
    if (!isBlank(numVal)) {
      Reflect.set(normalized, numColumn, toNumber(numVal));
    }
  }

  // Calculate and store GST and TAX fields based on requirements
  const qty = Reflect.get(normalized, 'QTYORDER') ?? 0;
  const rate = Reflect.get(normalized, 'RATE') ?? 0;
  const subtotal = qty * rate;

  Reflect.set(normalized, 'VALRECD', subtotal);
  Reflect.set(normalized, 'AFIELD1', subtotal);
  Reflect.set(normalized, 'TAX_ONAMOUNT', subtotal);

  const totalGst = Reflect.get(normalized, 'TAX_RATE') || toNumber(getValue(itemObject, 'gst', 'gstRate', 'gst_rate', 'taxRate', 'TAX_RATE'), 0);
  const totalTaxAmount = subtotal * (totalGst / 100);

  Reflect.set(normalized, 'CRAMT', subtotal + totalTaxAmount);

  if (gstNo && String(gstNo).trim().startsWith('22')) {
    const halfGst = totalGst / 2;
    Reflect.set(normalized, 'TAX_RATE1', halfGst);
    Reflect.set(normalized, 'TAX_RATE2', halfGst);
    Reflect.set(normalized, 'TAX_AMOUNT1', subtotal * (halfGst / 100));
    Reflect.set(normalized, 'TAX_AMOUNT2', subtotal * (halfGst / 100));
    Reflect.set(normalized, 'AFIELD8', Reflect.get(normalized, 'TAX_AMOUNT1'));
    Reflect.set(normalized, 'AFIELD9', Reflect.get(normalized, 'TAX_AMOUNT2'));
    Reflect.set(normalized, 'AFIELD10', 0);
    Reflect.set(normalized, 'TAX_RATE', Reflect.get(normalized, 'TAX_RATE1'));
    Reflect.set(normalized, 'TAX_AMOUNT', Reflect.get(normalized, 'TAX_AMOUNT1'));
  } else {
    Reflect.set(normalized, 'TAX_RATE1', totalGst);
    Reflect.set(normalized, 'TAX_AMOUNT1', totalTaxAmount);
    Reflect.set(normalized, 'TAX_RATE2', 0);
    Reflect.set(normalized, 'TAX_AMOUNT2', 0);
    Reflect.set(normalized, 'AFIELD10', Reflect.get(normalized, 'TAX_AMOUNT1'));
    Reflect.set(normalized, 'AFIELD8', 0);
    Reflect.set(normalized, 'AFIELD9', 0);
    Reflect.set(normalized, 'TAX_RATE', 0);
    Reflect.set(normalized, 'TAX_AMOUNT', 0);
  }

  for (const dateColumn of BODY_DATE_COLUMNS) {
    const dateVal = Reflect.get(normalized, dateColumn);
    if (!isBlank(dateVal)) {
      Reflect.set(normalized, dateColumn, toDbDate(dateVal));
    }
  }

  // Tolerance Basis logic
  const orderTol = Reflect.get(normalized, 'TOLERANCE_QTY') || 0;
  if (orderTol > 0) {
    Reflect.set(normalized, 'TOLERANCE_BASIS', 'Q');
  } else {
    Reflect.set(normalized, 'TOLERANCE_BASIS', null);
  }

  return normalized;
};

const buildInsertSql = (tableName, row, literalColumns = {}) => {
  const columns = Object.keys(row);
  const values = columns.map((column) => `:${column}`);

  for (const [column, literal] of Object.entries(literalColumns)) {
    if (columns.includes(column)) continue;
    columns.push(column);
    values.push(literal);
  }

  return {
    sql: `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')})`,
    binds: row
  };
};

const validateOrder = (header, bodyItems) => {
  const missing = [];
  if (!header.VRNO) missing.push('VRNO');
  if (!header.ACC_CODE) missing.push('ACC_CODE');
  if (!header.VRDATE) missing.push('VRDATE');
  if (!bodyItems.length) missing.push('items[]');

  bodyItems.forEach((item, index) => {
    if (!item.ITEM_CODE) missing.push(`items[${index}].ITEM_CODE`);
    if (!item.INDENT_VRNO) missing.push(`items[${index}].INDENT_VRNO`);
  });

  if (missing.length) {
    const err = new Error(`Required fields missing: ${missing.join(', ')}`);
    err.statusCode = 400;
    err.type = 'VALIDATION_ERROR';
    throw err;
  }
};

const getIndentDetails = async (connection, indentVrNo, itemCode) => {
  if (!indentVrNo || !itemCode) return null;

  try {
    const query = `
      SELECT 
        entity_code as "ENTITY_CODE",
        div_code as "DIV_CODE",
        dept_code as "DEPT_CODE",
        cost_code as "COST_CODE",
        slno as "SLNO",
        um as "UM",
        make_code as "MAKE_CODE",
        user_code as "USER_CODE"
      FROM view_indent_engine
      WHERE vrno = :indentVrNo AND item_code = :itemCode
    `;
    const result = await connection.execute(query, { indentVrNo, itemCode }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result.rows && result.rows.length > 0) {
      const [firstRow] = result.rows;
      return firstRow;
    }
    return null;
  } catch (error) {
    console.error(`Error querying view_indent_engine for indent: ${indentVrNo}, item: ${itemCode}:`, error.message);
    return null;
  }
};

const mapExternalPayload = (order) => {
  const variants = Array.isArray(order.order_variants) ? order.order_variants : [];
  const firstIndent = variants.at(0)?.indent_product || {};
  const gstNo = cleanValue(order.vendor?.gstin);
  const entityCode = cleanValue(firstIndent.entity_code) || undefined;

  let purchaserName = getValue(order, 'purchaserName', 'purchaser_name', 'purchaser');
  if (!purchaserName && order.order_confirmed_by && typeof order.order_confirmed_by === 'object') {
    purchaserName = cleanValue(order.order_confirmed_by.name || order.order_confirmed_by.username);
  }

  const today = new Date().toISOString().slice(0, 10);
  const vrDate = today;

  const deliveryDays = extractInt(order.order_delivery_period);
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + deliveryDays);
  const dueDate = dueDateObj.toISOString().slice(0, 10);

  const rawPo = order.po_number || '';

  const header = {
    entityCode,
    tCode: 'U',
    vrNo: undefined, // Always auto-generate from sequence
    vrDate,
    amendNo: 0,
    amendDate: vrDate,
    gstNo,
    userCode: cleanValue(firstIndent.user_code) || cleanValue(firstIndent.user_name) || 'SR002',
    tranType: 'PD',
    purchaserName: purchaserName || undefined,
    partyRefNo: getValue(order, 'partyRefNo', 'party_ref_no', 'partyrefno', 'rfq_id', 'rfqId') || undefined,
    partyRefDate: getValue(order, 'partyRefDate', 'party_ref_date', 'partyrefdate', 'rfq_date', 'rfqDate') || undefined,
    partyAckRefNo: rawPo.trim() || undefined,
    orderPriceBasis: cleanValue(order.order_price_basis) || undefined,
    orderPaymentTerm: cleanValue(order.order_payment_term) || undefined,
    orderDeliveryPeriod: cleanValue(order.order_delivery_period) || undefined,
    freightBasis: getValue(order, 'freightBasis', 'freight_basis') || undefined
  };

  let defaultDiv = 'CO';
  if (entityCode === 'AL') {
    defaultDiv = 'C2';
  } else if (entityCode === 'PA') {
    defaultDiv = 'C1';
  }

  const items = variants.map((variant, index) => {
    const indent = variant.indent_product || {};
    const slNoVal = toNumber(cleanValue(indent.slno) || cleanValue(indent.product_srno) || index + 1);
    return {
      slNo: slNoVal,
      divCode: cleanValue(indent.division_code) || defaultDiv,
      itemCode: cleanValue(indent.product_id),
      um: cleanValue(indent.uom) || undefined,
      qtyOrder: toNumber(variant.order_quantity || indent.quantity, 0),
      aum: cleanValue(indent.uom) || undefined,
      rate: toNumber(variant.order_price, 0),
      gst: toNumber(variant.gst || variant.product_gst || variant.gst_rate || variant.tax_rate || variant.taxRate || variant.gstRate || indent.gst_rate || indent.gst, 0),
      indentTCode: 'I',
      indentVrNo: cleanValue(indent.indent_number),
      indentSlNo: slNoVal,
      dueDate: dueDate,
      stockType: 'R',
      orderTolerance: toNumber(variant.order_tolerance || variant.orderTolerance, 0),
      irate: toNumber(variant.order_discount || variant.orderDiscount, 0) > 0 ? 'P' : undefined,
      iratei: toNumber(variant.order_discount || variant.orderDiscount, 0) > 0 ? toNumber(variant.order_discount || variant.orderDiscount, 0) : undefined
    };
  });

  return { header, items };
};

const lookupUserCodeByName = async (connection, userName) => {
  if (!userName || typeof userName !== 'string' || userName.trim() === '') return null;
  try {
    const result = await connection.execute(
      `SELECT USER_CODE as "user_code" FROM USER_MAST WHERE UPPER(TRIM(USER_NAME)) = UPPER(TRIM(:userName)) AND ROWNUM = 1`,
      { userName: userName.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      return row.USER_CODE || row.user_code;
    }
    return null;
  } catch (error) {
    console.error(`Error looking up user code for name: ${userName}:`, error.message);
    return null;
  }
};

const createOrder = async ({ header, items }) => {
  let connection;
  try {
    connection = await getConnection();

    // Resolve ENTITY_CODE early
    const headerObject = pairArrayToObject(header);

    // Look up purchaserName in USER_MAST
    let lookedUpUserCode = null;
    const purchaserName = getValue(headerObject, 'purchaserName', 'purchaser_name', 'purchaser');
    if (purchaserName) {
      lookedUpUserCode = await lookupUserCodeByName(connection, purchaserName);
      if (lookedUpUserCode) {
        console.log(`[orderService] Resolved user code: ${lookedUpUserCode} for purchaser: ${purchaserName}`);
        headerObject.CREATEDBY = lookedUpUserCode;
        headerObject.createdBy = lookedUpUserCode;
        headerObject.USER_CODE = lookedUpUserCode;
        headerObject.userCode = lookedUpUserCode;
      } else {
        console.log(`[orderService] User code not found in USER_MAST for purchaser: ${purchaserName}`);
      }
    }

    let entityCode = String(getValue(headerObject, 'entityCode', 'ENTITY_CODE', 'entity_code') || '').toUpperCase().trim();

    if (!entityCode && items && items.length > 0) {
      const firstItem = pairArrayToObject(items[0]);
      const itemCode = getValue(firstItem, 'itemCode', 'ITEM_CODE', 'product_id');
      const indentVrNo = getValue(firstItem, 'indentVrNo', 'INDENT_VRNO', 'indent_number');
      if (indentVrNo && itemCode) {
        const dbIndent = await getIndentDetails(connection, indentVrNo.trim(), itemCode.trim());
        if (dbIndent && dbIndent.ENTITY_CODE) {
          entityCode = dbIndent.ENTITY_CODE;
        }
      }
    }

    if (!entityCode) {
      entityCode = 'SR';
    }

    // Map entity to sequence prefix:
    // AL -> UMJ / MJ
    // PA -> UMC / MC
    // Default/SR -> UU3 / U3
    let prefixTable = 'UU3';
    let prefixVrNo = 'U3';
    if (entityCode === 'AL') {
      prefixTable = 'UMJ';
      prefixVrNo = 'MJ';
    } else if (entityCode === 'PA') {
      prefixTable = 'UMC';
      prefixVrNo = 'MC';
    }

    // 1. Generate new VRNO from sequence subquery
    const vrSeqResult = await connection.execute(`
      SELECT :prefixVrNo || TO_CHAR(SYSDATE,'YY') || 'Y-' || 
             LPAD(
                  NVL((
                      SELECT TO_NUMBER(t.lastvrno)
                      FROM vrseq_mast t
                      WHERE t.vrprefix = :prefixTable || TO_CHAR(SYSDATE,'YY') || 'Y-'
                  ),0) + 1,
             5,
             '0') AS "new_vrno"
      FROM dual
    `, { prefixVrNo, prefixTable }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const [firstSeqRow] = vrSeqResult.rows || [];
    if (!firstSeqRow || !firstSeqRow.new_vrno) {
      throw new Error("Failed to generate new VRNO using sequence query.");
    }
    const newVrNo = firstSeqRow.new_vrno;
    console.log(`Generated new VRNO: ${newVrNo} for entity ${entityCode}`);

    // Update sequence table vrseq_mast
    const updateResult = await connection.execute(`
      UPDATE vrseq_mast 
      SET lastvrno = TO_CHAR(TO_NUMBER(NVL(lastvrno, '0')) + 1)
      WHERE vrprefix = :prefixTable || TO_CHAR(SYSDATE,'YY') || 'Y-'
    `, { prefixTable }, { autoCommit: false });

    if (updateResult.rowsAffected === 0) {
      console.log(`[orderService] Sequence row does not exist for entity ${entityCode} prefix ${prefixTable}. Initializing sequence.`);
      await connection.execute(`
        INSERT INTO vrseq_mast (ENTITY_CODE, VRPREFIX, LASTVRNO)
        VALUES (:entityCode, :prefixTable || TO_CHAR(SYSDATE,'YY') || 'Y-', '1')
      `, { entityCode, prefixTable }, { autoCommit: false });
    }

    const normalizedHeader = normalizeHeader(headerObject, entityCode);
    normalizedHeader.ENTITY_CODE = entityCode; // Explicitly set the resolved entity code
    normalizedHeader.VRNO = newVrNo; // Assign the generated VRNO

    const gstNo = getValue(headerObject, 'gstNo', 'GSTIN', 'GSTINNO');
    let deliveryFromSlno = null;

    if (gstNo) {
      console.log(`Looking up ADDRESS_MAST details for GST: ${gstNo}`);
      const gstResult = await connection.execute(
        'SELECT ACC_CODE, SLNO FROM ADDRESS_MAST WHERE GSTINNO = :gstNo',
        { gstNo },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (gstResult.rows && gstResult.rows.length > 0) {
        const firstRow = gstResult.rows[0];
        const accCode = firstRow.ACC_CODE || firstRow.acc_code;
        const slno = firstRow.SLNO || firstRow.slno;
        if (!normalizedHeader.ACC_CODE) {
          normalizedHeader.ACC_CODE = accCode;
          console.log(`Found Acc Code: ${normalizedHeader.ACC_CODE} for GST: ${gstNo}`);
        }
        deliveryFromSlno = slno;
      } else if (!normalizedHeader.ACC_CODE) {
        const err = new Error(`No account matches GST: ${gstNo}`);
        err.statusCode = 404;
        err.type = 'ACCOUNT_NOT_FOUND';
        throw err;
      }
    }

    normalizedHeader.DELIVERY_FROM_SLNO = deliveryFromSlno;

    // Fetch contact details if ACC_CODE is present
    if (normalizedHeader.ACC_CODE) {
      console.log(`Looking up contact details for ACC_CODE: ${normalizedHeader.ACC_CODE}`);
      try {
        const contactResult = await connection.execute(
          'SELECT t.contact_person, t.mobile, t.email FROM acc_contact_mast t WHERE t.acc_code = :acc_code AND ROWNUM = 1',
          { acc_code: normalizedHeader.ACC_CODE },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (contactResult.rows && contactResult.rows.length > 0) {
          const firstRow = contactResult.rows[0];
          normalizedHeader.CONTACT_PERSON = firstRow.CONTACT_PERSON || firstRow.contact_person || null;
          normalizedHeader.CONTACT_DETAIL = firstRow.MOBILE || firstRow.mobile || null;
          normalizedHeader.CONTACT_EMAIL = firstRow.EMAIL || firstRow.email || null;
          console.log(`Resolved contact details for ACC_CODE ${normalizedHeader.ACC_CODE}:`, firstRow);
        } else {
          normalizedHeader.CONTACT_PERSON = null;
          normalizedHeader.CONTACT_DETAIL = null;
          normalizedHeader.CONTACT_EMAIL = null;
        }
      } catch (err) {
        console.error(`Error querying contact details for ACC_CODE ${normalizedHeader.ACC_CODE}:`, err.message);
        normalizedHeader.CONTACT_PERSON = null;
        normalizedHeader.CONTACT_DETAIL = null;
        normalizedHeader.CONTACT_EMAIL = null;
      }
    } else {
      normalizedHeader.CONTACT_PERSON = null;
      normalizedHeader.CONTACT_DETAIL = null;
      normalizedHeader.CONTACT_EMAIL = null;
    }

    // Set current date/timestamp values for ORDER_HEAD
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    normalizedHeader.VRDATE = currentDate;
    normalizedHeader.AMENDDATE = currentDate;
    normalizedHeader.CREATEDDATE = now;
    normalizedHeader.LASTUPDATE = now;

    const bodyItems = [];
    for (const [index, item] of (items || []).entries()) {
      const itemObject = pairArrayToObject(item);

      const itemCode = getValue(itemObject, 'itemCode', 'ITEM_CODE', 'product_id');
      const indentVrNo = getValue(itemObject, 'indentVrNo', 'INDENT_VRNO', 'indent_number');

      let dbIndent = null;
      if (indentVrNo && itemCode) {
        dbIndent = await getIndentDetails(connection, indentVrNo.trim(), itemCode.trim());
      }

      if (dbIndent) {
        console.log(`Found database indent details for ${indentVrNo} / ${itemCode}:`, dbIndent);

        const isValBlank = (val) => {
          return val === null || val === undefined || (typeof val === 'string' && val.trim() === '');
        };

        if (isValBlank(itemObject.ENTITY_CODE) && isValBlank(itemObject.entityCode) && isValBlank(itemObject.entity_code)) {
          itemObject.ENTITY_CODE = dbIndent.ENTITY_CODE;
        }
        if (isValBlank(itemObject.DIV_CODE) && isValBlank(itemObject.divCode) && isValBlank(itemObject.division_code)) {
          itemObject.DIV_CODE = dbIndent.DIV_CODE;
        }
        if (isValBlank(itemObject.DEPT_CODE) && isValBlank(itemObject.deptCode) && isValBlank(itemObject.dept_code)) {
          itemObject.DEPT_CODE = dbIndent.DEPT_CODE;
        }
        if (isValBlank(itemObject.COST_CODE) && isValBlank(itemObject.costCode) && isValBlank(itemObject.cost_code)) {
          itemObject.COST_CODE = dbIndent.COST_CODE;
        }
        if (isValBlank(itemObject.SLNO) && isValBlank(itemObject.slNo) && isValBlank(itemObject.slno)) {
          itemObject.SLNO = dbIndent.SLNO;
        }
        if (isValBlank(itemObject.indentSlNo) && isValBlank(itemObject.INDENT_SLNO) && isValBlank(itemObject.indent_slno)) {
          itemObject.indentSlNo = dbIndent.SLNO;
        }
        if (isValBlank(itemObject.UM) && isValBlank(itemObject.um) && isValBlank(itemObject.uom)) {
          itemObject.UM = dbIndent.UM;
        }
        if (isValBlank(itemObject.MAKE_CODE) && isValBlank(itemObject.makeCode) && isValBlank(itemObject.make_code)) {
          itemObject.MAKE_CODE = dbIndent.MAKE_CODE;
        }

        if (dbIndent.USER_CODE) {
          if (!lookedUpUserCode && (isValBlank(normalizedHeader.USER_CODE) || normalizedHeader.USER_CODE === 'SR002')) {
            normalizedHeader.USER_CODE = dbIndent.USER_CODE;
          }
          if (!lookedUpUserCode && (isValBlank(normalizedHeader.CREATEDBY) || normalizedHeader.CREATEDBY === 'SR002')) {
            normalizedHeader.CREATEDBY = dbIndent.USER_CODE;
          }
        }

        if (dbIndent.ENTITY_CODE && normalizedHeader.ENTITY_CODE === 'SR') {
          normalizedHeader.ENTITY_CODE = dbIndent.ENTITY_CODE;
        }
      }

      const normalizedItem = normalizeBodyItem(itemObject, index, normalizedHeader, gstNo);

      // Set current date values for ORDER_BODY
      normalizedItem.AMENDDATE = currentDate;
      normalizedItem.FROM_DATE = currentDate;
      normalizedItem.VRDATE = currentDate;

      const paymentDueDays = Number(normalizedHeader.PAYMENT_DUEDAYS || 0);
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + paymentDueDays);
      normalizedItem.DUEDATE = dueDate;

      bodyItems.push(normalizedItem);
    }

    // Calculate sum of VALRECD and CRAMT from body items and assign to header
    let totalValRecd = 0;
    let totalCrAmt = 0;
    for (const item of bodyItems) {
      totalValRecd += (item.VALRECD || 0);
      totalCrAmt += (item.CRAMT || 0);
    }
    normalizedHeader.VALRECD = totalValRecd;
    normalizedHeader.CRAMT = totalCrAmt;

    validateOrder(normalizedHeader, bodyItems);

    const headInsert = buildInsertSql('ORDER_HEAD', normalizedHeader);
    await connection.execute(headInsert.sql, headInsert.binds, { autoCommit: false });

    for (const item of bodyItems) {
      const bodyInsert = buildInsertSql('ORDER_BODY', item);
      await connection.execute(bodyInsert.sql, bodyInsert.binds, { autoCommit: false });
    }

    await connection.commit();
    return {
      message: `Order ${normalizedHeader.VRNO} created successfully with Account ${normalizedHeader.ACC_CODE}`,
      header: normalizedHeader
    };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};

module.exports = { createOrder, mapExternalPayload };
