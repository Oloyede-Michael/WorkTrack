function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with these details already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = { notFound, errorHandler };
