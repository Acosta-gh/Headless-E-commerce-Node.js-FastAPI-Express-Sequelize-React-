/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

module.exports = (err, req, res, next) => {
  // Ensure err is an object
  if (!err || typeof err !== 'object') {
    err = { message: String(err || 'Unknown error'), status: 500 };
  }

  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Data already exists',
      details: err.errors?.map(e => e.message),
      fields: err.fields
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors?.map(e => e.message)
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};