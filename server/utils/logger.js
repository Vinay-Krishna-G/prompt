const levelRank = { error: 0, warn: 1, info: 2, debug: 3 };

function shouldLog(level) {
  const envLevel = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return (levelRank[level] ?? 2) <= (levelRank[envLevel] ?? 2);
}

function log(level, message, meta) {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta && typeof meta === 'object') {
    // Avoid leaking secrets accidentally by only logging small meta objects.
    const safeMeta = JSON.stringify(meta, (k, v) => (k.toLowerCase().includes('password') ? '[REDACTED]' : v));
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](base, safeMeta);
    return;
  }
  // eslint-disable-next-line no-console
  console[level === 'debug' ? 'log' : level](base);
}

export const logger = Object.freeze({
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
});

