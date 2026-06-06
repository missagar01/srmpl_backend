const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateApiKey } = require('../middleware/auth');

router.post('/insert', validateApiKey, orderController.insertOrder);

module.exports = router;
