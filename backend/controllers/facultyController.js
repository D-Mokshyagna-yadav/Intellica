const Faculty = require("../models/Faculty");

exports.getProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id).select("-password");

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.status(200).json(faculty);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getFacultyById = async (req, res) => {
  try {

    const faculty = await Faculty
      .findById(req.params.id)
      .select("-password");

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found"
      });
    }

    res.status(200).json(faculty);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};