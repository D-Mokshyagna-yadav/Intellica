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

const securityMiddleware = require("./middleware/securityMiddleware");
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
app.use(securityMiddleware);
app.use(
  pinoHttp({
    logger,
    autoLogging: process.env.NODE_ENV === "production",
  })
);
app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || "1mb" }));
app.use(mongoSanitize());
app.use(requestSanitizer);

const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath, { index: false }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/credit-config", creditConfigRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/notifications", notificationRoutes);

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

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    logger.info("MongoDB connected");
    await bootstrapAdmin();
    app.listen(port, () => {
      logger.info({ port }, "Server started");
    });
  })
  .catch((error) => {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  });
