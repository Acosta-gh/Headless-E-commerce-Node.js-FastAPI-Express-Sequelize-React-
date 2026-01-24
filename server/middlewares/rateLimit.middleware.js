/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

/**
 * Rate limiter middleware for resend operations (e.g., email verification, password reset).
 * Restricts users to 1 request per 5-minute window to prevent abuse.
 */
const resendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 1,
  message: {
    error: "Too many requests. Please wait 5 minutes before resending.",
    retryAfter: 300,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usa email si está, sino la IP de forma segura
    return req.body.email || ipKeyGenerator(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests. Please wait 5 minutes before resending.",
      retryAfter: 300,
    });
  },
  skipFailedRequests: true,
});

/**
 * Rate limiter middleware for email verification attempts.
 * Restricts users to 10 requests per 15-minute window to prevent abuse.
 */
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    error: "Too many verification attempts. Please try again later.",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, 
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many verification attempts. Please try again in 15 minutes.",
      retryAfter: 900,
    });
  },
});

/**
 * Generic rate limiter
 */
const genericLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
      retryAfter: 60,
    });
  },
});

module.exports = {
  resendLimiter,
  verifyLimiter,
  genericLimiter,
};