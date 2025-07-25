const errorHandler = (err, req, res, next) => {
  // 로그 기록
  console.error(err.stack);

  // 에러 응답
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };