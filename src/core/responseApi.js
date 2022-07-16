const SUCCESS = (message, data, statusCode = 201) => {
  return {
    message,
    error: false,
    code: statusCode,
    data,
  };
};

const ERROR = (message, error, statusCode = 500) => {
  return {
    message,
    code: statusCode,
    error: true,
    errorMsg: error,
  };
};

module.exports = { SUCCESS, ERROR };
