const AuditLog = require("../models/AuditLog");
const logger = require("./logger");

async function logAudit({
  action,
  resourceType,
  resourceId = null,
  userId = null,
  userName = "",
  userRole = "",
  oldValue = null,
  newValue = null,
  changes = [],
  ipAddress = "",
  userAgent = "",
  metadata = {},
}) {
  try {
    const browserInfo = parseUserAgent(userAgent);

    const auditLog = new AuditLog({
      action,
      resourceType,
      resourceId,
      userId,
      userName,
      userRole,
      oldValue,
      newValue,
      changes,
      ipAddress,
      userAgent,
      browser: browserInfo.browser,
      device: browserInfo.device,
      os: browserInfo.os,
      metadata,
      isImmutable: true,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    logger.error({ err: error, action, resourceType }, "Failed to create audit log");
    return null;
  }
}

function parseUserAgent(userAgent) {
  const result = {
    browser: "Unknown",
    device: "Desktop",
    os: "Unknown",
  };

  if (!userAgent) {
    return result;
  }

  const ua = userAgent.toLowerCase();

  // Detect OS
  if (ua.includes("windows")) {
    result.os = "Windows";
  } else if (ua.includes("mac os")) {
    result.os = "macOS";
  } else if (ua.includes("linux")) {
    result.os = "Linux";
  } else if (ua.includes("android")) {
    result.os = "Android";
    result.device = "Mobile";
  } else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
    result.os = "iOS";
    result.device = "Mobile";
  }

  // Detect Browser
  if (ua.includes("chrome")) {
    result.browser = "Chrome";
  } else if (ua.includes("firefox")) {
    result.browser = "Firefox";
  } else if (ua.includes("safari")) {
    result.browser = "Safari";
  } else if (ua.includes("edge")) {
    result.browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    result.browser = "Opera";
  }

  // Detect Device
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    result.device = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad")) {
    result.device = "Tablet";
  }

  return result;
}

function createAuditMiddleware(options = {}) {
  const { resourceType, getIdFromRequest } = options;

  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    let responseData = null;

    res.json = (data) => {
      responseData = data;
      return originalJson(data);
    };

    res.send = (data) => {
      responseData = data;
      return originalSend(data);
    };

    res.on("finish", async () => {
      if (res.statusCode >= 400) {
        return;
      }

      const action = mapHttpMethodToAction(req.method);

      if (!action) {
        return;
      }

      let resourceId = null;
      if (getIdFromRequest) {
        resourceId = getIdFromRequest(req, responseData);
      } else if (responseData?.data?._id) {
        resourceId = responseData.data._id;
      } else if (responseData?._id) {
        resourceId = responseData._id;
      } else if (req.params.id) {
        resourceId = req.params.id;
      }

      await logAudit({
        action,
        resourceType,
        resourceId,
        userId: req.user?.id || null,
        userName: req.user?.name || "",
        userRole: req.user?.role || "",
        ipAddress: req.ip || req.connection?.remoteAddress || "",
        userAgent: req.get("user-agent") || "",
        metadata: {
          method: req.method,
          path: req.path,
          query: req.query,
        },
      });
    });

    next();
  };
}

function mapHttpMethodToAction(method) {
  const mapping = {
    GET: "read",
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
  };
  return mapping[method] || null;
}

module.exports = {
  logAudit,
  createAuditMiddleware,
  parseUserAgent,
};
