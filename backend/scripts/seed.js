#!/usr/bin/env node

require("dotenv").config();
const mongoose = require("mongoose");
const { seedAll } = require("../utils/seedData");
const logger = require("../utils/logger");

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected for seeding");

    await seedAll();

    logger.info("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Seeding failed");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

runSeed();
