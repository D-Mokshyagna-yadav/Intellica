const ExcelJS = require("exceljs");
const Upload = require("../models/Upload");

exports.downloadFacultyReport = async (req, res) => {
  try {

    const facultyId = req.query.facultyId || req.user.id;
    const { category, year } = req.query;

    let filter = {
      faculty: facultyId,
      status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] }
    };

    if (category && category.trim() !== "") {
      filter.category = new RegExp(category.trim(), "i");
    }

    // ✅ year field use చేయండి — createdAt కాదు
    if (year && !isNaN(year)) {
      filter.year = Number(year);
    }

    console.log("FINAL FILTER:", filter);

    const uploads = await Upload.find(filter).sort({ createdAt: -1 });

    console.log("FOUND:", uploads.length);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Faculty Activities");

    sheet.columns = [
      { header: "Category", key: "category", width: 20 },
      { header: "Title", key: "title", width: 40 },
      { header: "Credits", key: "credits", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Year", key: "year", width: 10 },
      { header: "Date", key: "date", width: 20 }
    ];

    uploads.forEach(upload => {
      sheet.addRow({
        category: upload.category,
        title: upload.title,
        credits: upload.credits,
        status: upload.status,
        year: upload.year || new Date(upload.createdAt).getFullYear(),
        date: new Date(upload.createdAt).toLocaleDateString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=faculty_activities.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel download failed" });
  }
};

exports.downloadDepartmentReport = async (req, res) => {
  try {

    const department = req.user.department;

    const uploads = await Upload.find({
      department,
      status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] }
    }).populate("faculty", "name employeeId");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Department Activities");

    sheet.columns = [
      { header: "Faculty Name", key: "faculty", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Title", key: "title", width: 40 },
      { header: "Credits", key: "credits", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Year", key: "year", width: 10 },
      { header: "Date", key: "date", width: 20 }
    ];

    uploads.forEach(upload => {
      sheet.addRow({
        faculty: upload.faculty?.name || "",
        category: upload.category,
        title: upload.title,
        credits: upload.credits,
        status: upload.status,
        year: upload.year || new Date(upload.createdAt).getFullYear(),
        date: new Date(upload.createdAt).toLocaleDateString()
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=department_activities.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Department download failed" });
  }
};