export const mockUploads = [
  {
    id: 1,
    facultyId: "F1",
    facultyName: "Faculty A",
    department: "CSE",
    category: "Publications",
    credits: 20,
    status: "approved",

    // ✅ Faculty upload → HOD approval
    submittedByRole: "faculty",
  },
  {
    id: 2,
    facultyId: "F1",
    facultyName: "Faculty A",
    department: "CSE",
    category: "Conferences",
    credits: 10,
    status: "approved",

    // ✅ Faculty upload → HOD approval
    submittedByRole: "faculty",
  },
  {
    id: 100,
    facultyId: "HOD1",
    facultyName: "HOD Name",
    department: "CSE",
    category: "Publications",
    credits: 25,
    status: "approved",

    // ✅ HOD upload → Admin approval
    submittedByRole: "hod",
  },
  {
    id: 101,
    facultyId: "HOD1",
    facultyName: "HOD Name",
    department: "CSE",
    category: "FDPs",
    credits: 15,
    status: "approved",

    // ✅ HOD upload → Admin approval
    submittedByRole: "hod",
  },
];
