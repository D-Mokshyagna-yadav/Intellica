const Faculty = require("../models/Faculty");
const ROLES = require("../constants/roles");
const { AppError } = require("../utils/errors");

exports.getProfile = async (req, res) => {
  const faculty = await Faculty.findById(req.user.id).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  res.status(200).json(faculty);
};

exports.getFacultyById = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  if (req.user.role === ROLES.HOD && faculty.department !== req.user.department) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json(faculty);
};
