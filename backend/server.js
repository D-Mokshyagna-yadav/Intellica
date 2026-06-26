const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoSanitize = require("express-mongo-sanitize");
const pinoHttp = require("pino-http");

require("dotenv").config();
const logger = require("./utils/logger");
require("./utils/validateEnv");

const { securityMiddleware, apiLimiter, authLimiter } = require("./middleware/securityMiddleware");
const requestSanitizer = require("./middleware/requestSanitizer");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const bootstrapAdmin = require("./utils/bootstrapAdmin");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const hodRoutes = require("./routes/hodRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const reportRoutes = require("./routes/reportRoutes");
const creditConfigRoutes = require("./routes/creditConfigRoutes");
const rankingRoutes = require("./routes/rankingroutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// Security middleware (Helmet with enhanced CSP)
app.use(securityMiddleware);

// Rate limiting for general API endpoints
app.use("/api", apiLimiter);

// Stricter rate limiting for authentication endpoints
app.use("/api/auth", authLimiter);

// Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: process.env.NODE_ENV === "production",
  })
);

// Body parsing with size limits
app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || "1mb" }));

// NoSQL injection protection
app.use(mongoSanitize());

// Request sanitization
app.use(requestSanitizer);

// Static files for uploads
const uploadsPath = fs.existsSync("/documents") ? "/documents" : path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath, { index: false }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  const statusCode = dbStatus === "up" ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === "up" ? "ok" : "error",
    services: {
      database: dbStatus,
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/credit-config", creditConfigRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/notifications", notificationRoutes);

// Frontend static files and SPA routing
const frontendDistCandidates = [path.join(__dirname, "dist"), path.join(__dirname, "..", "frontend", "dist")];
const frontendDistPath = frontendDistCandidates.find((candidatePath) => fs.existsSync(candidatePath));

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
const port = Number(process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    logger.info("MongoDB connected");
    await bootstrapAdmin();
    const server = app.listen(port, () => {
      logger.info({ port }, "Server started");
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        mongoose.connection.close().then(() => {
          logger.info("MongoDB connection closed.");
          process.exit(0);
        }).catch((err) => {
          logger.error({ err }, "Error closing MongoDB connection.");
          process.exit(1);
        });
      });

      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  });
