const orderService = require('../services/orderService');

const insertOrder = async (req, res, next) => {
  try {
    let payload = req.body;

    // If it's an array of orders, process the first one
    if (Array.isArray(payload)) {
      const [firstPayload] = payload;
      payload = firstPayload;
    }

    let header, items;

    // Detect if this is the external payload format
    if (payload && (payload.po_number || payload.order_variants)) {
      const mapped = orderService.mapExternalPayload(payload);
      header = mapped.header;
      items = mapped.items;
    } else if (payload) {
      header = payload.header;
      items = payload.items || payload.body;
    }

    if (!header || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Required fields missing (header, items[] or body[]).' });
    }

    await orderService.createOrder({ header, items });
    res.status(200).json({ status: true, message: 'Order created successfully.' });
  } catch (err) {
    if (err.type === 'ACCOUNT_NOT_FOUND' || err.type === 'VALIDATION_ERROR') {
      return res.status(err.statusCode).json({ error: err.type, details: err.message });
    }
    next(err);
  }
};

module.exports = { insertOrder };
