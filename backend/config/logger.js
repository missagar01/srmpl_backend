// Mirrors console output into daily rotating files under backend/logs/
// so server status and errors survive after the terminal window is gone.
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const currentLogFile = () => path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`);

const stringifyArg = (arg) => {
  if (arg instanceof Error) return arg.stack || arg.message;
  if (typeof arg === 'object' && arg !== null) {
    try { return JSON.stringify(arg); } catch (_) { return String(arg); }
  }
  return String(arg);
};

const writeLine = (level, args) => {
  const line = `[${new Date().toISOString()}] [${level}] ${args.map(stringifyArg).join(' ')}`;
  fs.appendFile(currentLogFile(), line + '\n', () => {});
  return line;
};

const wrap = (level, original) => (...args) => {
  original(writeLine(level, args));
};

console.log = wrap('INFO', console.log.bind(console));
console.warn = wrap('WARN', console.warn.bind(console));
console.error = wrap('ERROR', console.error.bind(console));
