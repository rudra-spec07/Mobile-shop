/**
 * Performance monitoring & slow request detection middleware.
 * Measures HTTP response durations and logs slow request warnings.
 */
const SLOW_REQUEST_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS, 10) || 500;

const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    // Attach response time header for client observability
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
      }
    } catch (e) {}

    // Slow request detection warning
    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      console.warn(
        `🐢 [SLOW REQUEST ALERT] ${req.method} ${req.originalUrl} executed in ${durationMs.toFixed(2)} ms (Status: ${res.statusCode})`
      );
    }
  });

  next();
};

module.exports = {
  performanceMiddleware,
  SLOW_REQUEST_THRESHOLD_MS,
};
