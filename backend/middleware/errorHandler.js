// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Log đầy đủ thông tin lỗi
  console.error('Error stack:', err.stack);
  console.error('Request body:', req.body);
  console.error('Request params:', req.params);
  console.error('Request query:', req.query);
  
  // Trả về response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};