const logger = require("./logger");

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "EMAIL_USER", "EMAIL_APP_PASSWORD"];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  logger.error({ missingVars }, "Missing required environment variables");
  process.exit(1);
}

logger.info("Environment variables validated successfully");
