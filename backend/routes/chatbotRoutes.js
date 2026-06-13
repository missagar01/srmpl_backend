const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { validateApiKey } = require('../middleware/auth');

// Public route to allow the local frontend to retrieve the API key for headers
router.get('/config', (req, res) => {
  res.status(200).json({ apiKey: process.env.API_KEY || '' });
});

// Protected routes for chatbot operations
router.get('/items', validateApiKey, chatbotController.searchItems);
router.get('/stock/:itemCode', validateApiKey, chatbotController.getItemStock);
router.get('/series', validateApiKey, chatbotController.getIndentSeries);
router.get('/departments', validateApiKey, chatbotController.getDepartments);
router.get('/cost-codes', validateApiKey, chatbotController.getCostCodes);
router.get('/employees', validateApiKey, chatbotController.getEmployees);
router.get('/makes', validateApiKey, chatbotController.getMakes);
router.post('/indent', validateApiKey, chatbotController.createIndent);

module.exports = router;
