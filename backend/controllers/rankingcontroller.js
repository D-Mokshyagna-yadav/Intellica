const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const { rankFaculty } = require("../services/rankingDecisiontree");
const { getCategoryConfig } = require("../constants/categories");

const APPROVED_STATUSES = ["HOD_APPROVED", "ADMIN_APPROVED"];

function createEmptyParticipant(participant) {
  return {
    facultyId: participant._id.toString(),
    name: participant.name || "Unknown",
    department: participant.department || "Unknown",
    createdByRole: participant.role || "FACULTY",
    totalCredits: 0,
    publications: 0,
    conferences: 0,
    fdps: 0,
    workshop: 0,
    book: 0,
    nptel: 0,
    seminar: 0,
    webinar: 0,
    guestlecture: 0,
    honorsawards: 0,
    certification: 0,
    researchpolicy: 0,
    membership: 0,
    ipr: 0,
    consultancy: 0,
    incubation: 0,
    researchprojects: 0,
    doctoralthesis: 0,
    mous: 0,
    others: 0,
  };
}

const rankingFieldMap = {
  publications: "publications",
  conferences: "conferences",
  workshops: "workshop",
  fdps: "fdps",
  guestLectures: "guestlecture",
  seminars: "seminar",
  webinars: "webinar",
  books: "book",
  nptel: "nptel",
  honorsAwards: "honorsawards",
  certifications: "certification",
  researchPolicies: "researchpolicy",
  professionalMemberships: "membership",
  iprs: "ipr",
  incubations: "incubation",
  consultancies: "consultancy",
  mous: "mous",
  researchProjects: "researchprojects",
  doctoralTheses: "doctoralthesis",
  others: "others",
};

async function buildLeaderboard() {
  const [uploads, allFaculty, allHods] = await Promise.all([
    Upload.find({ status: { $in: APPROVED_STATUSES } }).lean(),
    Faculty.find({ isApproved: true, status: "APPROVED" }).lean(),
    HOD.find({ isApproved: true, status: "APPROVED" }).lean(),
  ]);

  const participantMap = new Map();

  [...allFaculty, ...allHods].forEach((participant) => {
    participantMap.set(participant._id.toString(), createEmptyParticipant(participant));
  });

  uploads.forEach((upload) => {
    if (!upload.faculty) {
      return;
    }

    const participantId = upload.faculty.toString();
    if (!participantMap.has(participantId)) {
      participantMap.set(participantId, {
        facultyId: participantId,
        name: "Unknown",
        department: upload.department || "Unknown",
        createdByRole: upload.createdByRole || "FACULTY",
        totalCredits: 0,
        publications: 0,
        conferences: 0,
        fdps: 0,
        workshop: 0,
        book: 0,
        nptel: 0,
        seminar: 0,
        webinar: 0,
        guestlecture: 0,
        honorsawards: 0,
        certification: 0,
        researchpolicy: 0,
        membership: 0,
        ipr: 0,
        consultancy: 0,
        incubation: 0,
        researchprojects: 0,
        doctoralthesis: 0,
        mous: 0,
        others: 0,
      });
    }

    const participant = participantMap.get(participantId);
    participant.totalCredits += Number(upload.credits) || 0;
    participant.department = participant.department || upload.department || "Unknown";
    participant.createdByRole = participant.createdByRole || upload.createdByRole || "FACULTY";

    const categoryConfig = getCategoryConfig(upload.category);
    const rankingKey = categoryConfig?.rankingKey;
    const scoreField = rankingKey ? rankingFieldMap[rankingKey] : null;
    if (scoreField) {
      participant[scoreField] += 1;
    }
  });

  const ranked = rankFaculty(
    Array.from(participantMap.values()).filter(
      (participant) => participant.name !== "Unknown" && participant.department !== "Unknown"
    )
  );

  ranked.sort((a, b) => b.score - a.score || b.totalCredits - a.totalCredits);
  ranked.forEach((participant, index) => {
    participant.collegeRank = index + 1;
    participant.collegeTotal = ranked.length;
  });

  const departmentGroups = ranked.reduce((accumulator, participant) => {
    const department = String(participant.department || "Unknown").toUpperCase();
    accumulator[department] = accumulator[department] || [];
    accumulator[department].push(participant);
    return accumulator;
  }, {});

  const finalRanked = [];
  Object.entries(departmentGroups).forEach(([department, participants]) => {
    participants.sort((a, b) => b.score - a.score || b.totalCredits - a.totalCredits);
    participants.forEach((participant, index) => {
      participant.rank = index + 1;
      participant.departmentTotal = participants.length;
      participant.department = department;
    });
    finalRanked.push(...participants);
  });

  return finalRanked;
}

exports.getRanking = async (req, res) => {
  const rankings = await buildLeaderboard();
  const requestedDepartment = String(req.query.department || "").trim().toUpperCase();

  const filtered = requestedDepartment
    ? rankings.filter((participant) => participant.department === requestedDepartment)
    : rankings;

  res.json(filtered);
};

exports.getMyRank = async (req, res) => {
  const rankings = await buildLeaderboard();
  const participantId = req.params.id || req.user.id;
  const participant = rankings.find((item) => item.facultyId === participantId);

  res.json(
    participant
      ? {
          departmentRank: participant.rank,
          departmentTotal: participant.departmentTotal,
          collegeRank: participant.collegeRank,
          collegeTotal: participant.collegeTotal,
          score: participant.score,
          totalCredits: participant.totalCredits,
        }
      : {
          departmentRank: null,
          departmentTotal: 0,
          collegeRank: null,
          collegeTotal: rankings.length,
          score: 0,
          totalCredits: 0,
        }
  );
};
