const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/insert', orderController.insertOrder);

module.exports = router;
