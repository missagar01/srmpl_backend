require('dotenv').config();
require('./config/db'); // Initialize Oracle Client on startup

const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes
const orderRoutes = require('./routes/orderRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
