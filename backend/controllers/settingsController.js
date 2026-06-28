const Settings = require("../models/Settings");
const { AppError } = require("../utils/errors");

exports.getAllSettings = async (req, res) => {
  const category = req.query.category;
  const filter = category ? { category } : {};

  const settings = await Settings.find(filter).sort({ category: 1, key: 1 });
  res.json(settings);
};

exports.getSettingByKey = async (req, res) => {
  const { key } = req.params;
  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw new AppError(`Setting ${key} not found`, 404);
  }

  res.json(setting);
};

exports.updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value, description, isSystem, isEditable } = req.body;

  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw new AppError(`Setting ${key} not found`, 404);
  }

  if (setting.isSystem && !setting.isEditable) {
    throw new AppError(`Setting ${key} is a system setting and cannot be modified`, 403);
  }

  setting.value = value !== undefined ? value : setting.value;
  setting.description = description !== undefined ? description : setting.description;
  setting.isSystem = isSystem !== undefined ? isSystem : setting.isSystem;
  setting.isEditable = isEditable !== undefined ? isEditable : setting.isEditable;

  await setting.save();

  res.json({
    message: "Setting updated successfully",
    setting,
  });
};

exports.createSetting = async (req, res) => {
  const { key, value, category, description, isSystem, isEditable } = req.body;

  if (!key || value === undefined) {
    throw new AppError("Key and value are required", 400);
  }

  const existing = await Settings.findOne({ key });
  if (existing) {
    throw new AppError(`Setting with key ${key} already exists`, 400);
  }

  const newSetting = await Settings.create({
    key,
    value,
    category: category || "general",
    description: description || "",
    isSystem: isSystem || false,
    isEditable: isEditable !== undefined ? isEditable : true,
  });

  res.status(201).json({
    message: "Setting created successfully",
    setting: newSetting,
  });
};

exports.deleteSetting = async (req, res) => {
  const { key } = req.params;

  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw new AppError(`Setting ${key} not found`, 404);
  }

  if (setting.isSystem) {
    throw new AppError(`Setting ${key} is a system setting and cannot be deleted`, 403);
  }

  await Settings.findOneAndDelete({ key });

  res.json({ message: "Setting deleted successfully" });
};
