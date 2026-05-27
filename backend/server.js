const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Validate environment variables
require("./utils/validateEnv");

/* ================= ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const hodRoutes = require("./routes/hodRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const reportRoutes = require("./routes/reportRoutes");
const creditConfigRoutes = require("./routes/creditConfigRoutes");
const rankingRoutes = require("./routes/rankingroutes");

/* ================= MIDDLEWARE ================= */

const securityMiddleware = require("./middleware/securityMiddleware");

/* ================= APP ================= */

const app = express();

/* =====================================================
   MIDDLEWARE STACK
===================================================== */

// Security headers
app.use(securityMiddleware);

// Enable CORS
app.use(cors());


// JSON & Form Data Support
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded files
app.use("/uploads", express.static("uploads"));

/* =====================================================
   API ROUTES (IMPORTANT: BEFORE STATIC)
===================================================== */

app.use("/api/rank", require("./routes/rankRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/credit-config", creditConfigRoutes);
app.use("/api/ranking", rankingRoutes);
/* =====================================================
   STATIC FRONTEND (AFTER API)
===================================================== */

app.use(express.static(path.join(__dirname, "dist")));

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({ status: "Faculty Research Management API Running" });
});

/* =====================================================
   SPA FALLBACK (LAST)
===================================================== */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* =====================================================
   GLOBAL ERROR HANDLER (VERY IMPORTANT)
===================================================== */

app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err.message);
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

/* =====================================================
   DATABASE CONNECTION & SERVER STARTUP
===================================================== */

const DEFAULT_PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {

  console.log("✅ MongoDB Connected");

  app.listen(DEFAULT_PORT, () => {
    console.log(`🔥 Server running on port ${DEFAULT_PORT}`);
  });

})
.catch((err) => {
  console.error("❌ MongoDB Connection Error:", err);
});