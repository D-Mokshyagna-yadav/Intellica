const Notification = require("../models/Notification");
const Faculty = require("../models/Faculty");
const createUserFolder = require("../utils/createUserFolder");


/* =====================================================
   GET PENDING FACULTY (DEPARTMENT SAFE)
===================================================== */
exports.getPendingFaculty = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const faculty = await Faculty.find({
      status: { $in: ["PENDING", "DISCUSSION"] },
      department: req.user.department
    });

    res.status(200).json(faculty);

  } catch (error) {

    console.error("GET PENDING FACULTY ERROR:", error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};


/* =====================================================
   APPROVE FACULTY
===================================================== */
exports.approveFaculty = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    /* CHECK SAME DEPARTMENT */

    if (faculty.department !== req.user.department) {
      return res.status(403).json({
        message: "You cannot approve faculty from another department"
      });
    }

    /* UPDATE STATUS */

    faculty.status = "APPROVED";
    faculty.isApproved = true;

    await faculty.save();

    /* CREATE FACULTY FOLDER */

    if (faculty.employeeId) {
      createUserFolder("faculty", faculty.employeeId);
    }

    /* CREATE NOTIFICATION */

    await Notification.create({
      message: `${req.user.name} approved faculty ${faculty.name}`,
      role: "HOD"
    });

    res.status(200).json({
      message: "Faculty approved successfully",
      faculty
    });

  } catch (error) {

    console.error("APPROVE FACULTY ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};



/* =====================================================
   CALL FOR DISCUSSION
===================================================== */
exports.discussionFaculty = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    /* CHECK SAME DEPARTMENT */

    if (faculty.department !== req.user.department) {
      return res.status(403).json({
        message: "You cannot manage faculty from another department"
      });
    }

    /* UPDATE STATUS */

    faculty.status = "DISCUSSION";
    await faculty.save();

    /* CREATE NOTIFICATION */

    await Notification.create({
      message: `${req.user.name} called ${faculty.name} for discussion`,
      role: "HOD"
    });

    res.status(200).json({
      message: "Faculty called for discussion"
    });

  } catch (error) {

    console.error("DISCUSSION FACULTY ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
/* =====================================================
   GET APPROVED FACULTY FOR HOD DEPARTMENT
===================================================== */
exports.getApprovedFaculty = async (req, res) => {
  try {

    console.log("HOD USER:", req.user);

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const faculty = await Faculty.find({
      status: "APPROVED"
    });

    const hodDept = (req.user.department || "").toLowerCase().trim();

    const filtered = faculty.filter(f => {
      const facultyDept = (f.department || "").toLowerCase().trim();

      return facultyDept.includes(hodDept) || hodDept.includes(facultyDept);
    });

    console.log("HOD DEPT:", req.user.department);
    console.log("FACULTY COUNT:", filtered.length);

    res.json(filtered);

  } catch (error) {
    console.error("GET APPROVED FACULTY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const Upload = require("../models/Upload");

/* =====================================================
   GET FACULTY UPLOADS FOR HOD DASHBOARD
===================================================== */
exports.getFacultyUploads = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (faculty.department !== req.user.department) {
      return res.status(403).json({
        message: "You cannot view another department faculty"
      });
    }

   const uploads = await Upload.find({
  faculty: facultyId
});

    res.json(uploads);

  } catch (error) {

    console.error("GET FACULTY UPLOADS ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};
/* =====================================================
   GET HOD PROFILE
===================================================== */

const HOD = require("../models/HOD");

exports.getHodProfile = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const hod = await HOD.findById(req.user.id).select("-password");

    if (!hod) {
      return res.status(404).json({
        message: "HOD not found"
      });
    }

    res.json(hod);

  } catch (error) {

    console.error("GET HOD PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

};