function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
}

function createError(statusCode, message, errors) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errors = errors;
  return err;
}

module.exports = { errorHandler, createError };
