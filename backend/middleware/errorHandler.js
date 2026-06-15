const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.type || 'Internal Server Error',
    details: err.message
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
