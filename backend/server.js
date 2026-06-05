require('dotenv').config();
require('./config/db'); // Initialize Oracle Client on startup

const express = require('express');
const cors = require('cors');

// Routes
const orderRoutes = require('./routes/orderRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', orderRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
