const zlib = require('zlib');

/**
 * Lightweight, zero-dependency Express response compression middleware.
 * Compresses JSON/Text HTTP responses using native Node.js zlib.
 * Threshold: 1024 bytes (1 KB).
 */
const compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  if (!acceptEncoding.includes('gzip') && !acceptEncoding.includes('deflate')) {
    return next();
  }

  const originalSend = res.send;

  res.send = function (body) {
    if (res.headersSent) {
      return originalSend.call(this, body);
    }

    // Skip compression for small payloads or non-compressible types
    const contentType = res.getHeader('Content-Type') || '';
    const isCompressible =
      typeof body === 'string' ||
      Buffer.isBuffer(body) ||
      contentType.includes('application/json') ||
      contentType.includes('text/');

    if (!isCompressible) {
      return originalSend.call(this, body);
    }

    let buffer = Buffer.isBuffer(body)
      ? body
      : typeof body === 'string'
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body));

    if (buffer.length < 1024) {
      return originalSend.call(this, body);
    }

    try {
      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(buffer);
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        res.removeHeader('ETag');
        return res.end(compressed);
      } else if (acceptEncoding.includes('deflate')) {
        const compressed = zlib.deflateSync(buffer);
        res.setHeader('Content-Encoding', 'deflate');
        res.setHeader('Content-Length', compressed.length);
        res.removeHeader('ETag');
        return res.end(compressed);
      }
    } catch (err) {
      // Fallback silently if compression fails
      return originalSend.call(this, body);
    }

    return originalSend.call(this, body);
  };

  next();
};

module.exports = {
  compressionMiddleware,
};
