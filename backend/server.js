require("dotenv").config();
require("./config/logger"); // Mirror console output to backend/logs/*.log

// Safety net: log fatal errors instead of letting the process die silently
// (previously an unhandled DB/tunnel error would kill the whole server
// with nothing recorded anywhere, requiring a manual restart).
process.on("unhandledRejection", (reason) => {
  console.error("[fatal-guard] Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[fatal-guard] Uncaught exception:", err);
});

require("./config/db"); // Initialize Oracle Client on startup

const express = require("express");
const cors = require("cors");
const path = require("path");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

// Jobs
const indentSyncJob = require("./jobs/indentSyncJob");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
// Order payloads can carry many variants/indent products - default 100kb is tight.
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "5mb" }));

// Serve Static Frontend
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", orderRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Error Handling Middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  indentSyncJob.start();
});

// Heartbeat: proves in the logs that the process is alive even when there's
// nothing else to report, and surfaces the last indent-sync outcome.
setInterval(() => {
  const status = indentSyncJob.getStatus();
  console.log(
    `[heartbeat] Backend alive. Uptime: ${Math.floor(process.uptime() / 60)}m. `
    + `Last indent sync: ${status.lastRunAt ? status.lastRunAt.toISOString() : "not run yet"} (${status.lastRunStatus}).`
  );
}, 5 * 60 * 1000);
