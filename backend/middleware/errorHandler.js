/** Turns every unhandled error into a JSON response. */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }
  if (err.code && String(err.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(409).json({ success: false, message: 'Database constraint failed', detail: err.message });
  }
  console.error('[error]', err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
}

module.exports = { notFound, errorHandler };
