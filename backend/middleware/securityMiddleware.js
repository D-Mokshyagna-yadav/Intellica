/**
 * Security Middleware - Adds security headers and protection
 * Place this early in your middleware stack
 */

module.exports = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Disable referrer information on navigation
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent access to sensitive features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Strict transport security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};
