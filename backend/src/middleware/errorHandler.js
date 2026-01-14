/**
 * Global Error Handler Middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      message: 'ข้อมูลซ้ำ',
      error: err.detail || err.message
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลที่อ้างอิงไม่ถูกต้อง',
      error: err.detail || err.message
    });
  }

  if (err.code === '23502') { // Not null violation
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลไม่ครบถ้วน',
      error: err.detail || err.message
    });
  }

  if (err.code === '22P02') { // Invalid text representation
    return res.status(400).json({
      success: false,
      message: 'รูปแบบข้อมูลไม่ถูกต้อง',
      error: err.message
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'ไม่พบเส้นทาง API ที่ร้องขอ',
    path: req.originalUrl
  });
};

/**
 * Async Handler - ห่อหุ้ม async functions เพื่อจัดการ errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
