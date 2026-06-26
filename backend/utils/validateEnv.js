const logger = require("./logger");

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const optionalEmailEnvVars = ["EMAIL_USER", "EMAIL_APP_PASSWORD"];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  logger.error({ missingVars }, "Missing required environment variables");
  process.exit(1);
}

const missingEmailVars = optionalEmailEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEmailVars.length > 0) {
  logger.warn(
    { missingVars: missingEmailVars },
    "Email credentials are not configured; OTP and notification emails will be unavailable until they are set"
  );
}

logger.info("Environment variables validated successfully");
