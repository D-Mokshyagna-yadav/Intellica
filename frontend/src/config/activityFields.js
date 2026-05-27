export const activityFields = {

/* ================= PUBLICATION ================= */

Publication: [

{
name: "paperTitle",label: "Paper Title",type: "text",required: true
},

{
name: "journalTitle",label: "Journal Title",type: "text"
},

{
name: "publisher",
label: "Publisher",
type: "text"
},

{
name: "volume",
label: "Volume",
type: "text"
},

{
name: "paperType",
label: "Paper Type",
type: "select",
options: ["Journal","Conference","Other"]
},

{
name: "otherPaperType",
label: "Specify Paper Type",
type: "text",
showIf: { field: "paperType", value: "Other" }
},

{
name: "impactFactor",
label: "Journal Impact Factor",
type: "number"
},

{
name: "indexing",
label: "Indexing",
type: "select",
options: ["Scopus","SCI","ESCI","UGC","Other"]
},

{
name: "otherIndexing",
label: "Specify Indexing",
type: "text",
showIf: { field: "indexing", value: "Other" }
},

{
name: "quartile",
label: "Quartile",
type: "select",
options: ["Q1","Q2","Q3","Q4"],
showIf: { field: "indexing", value: "Scopus" }
},

{
name: "doi",
label: "DOI",
type: "text"
},

{
name: "publicationMonthYear",
label: "Publication Month & Year",
type: "month"
}

],


/* ================= CONFERENCE ================= */

Conference: [

{
name: "conferenceName",
label: "Conference Name",
type: "text",
required: true
},

{
name: "role",
label: "Role",
type: "select",
options: ["Conference Presentation","Participation","Organized"]
},

{
name: "conferenceTitle",
label: "Conference Title",
type: "text",
showIf: { field: "role", value: "Conference Presentation" }
},

{
name: "fundingType",
label: "Funding Agency",
type: "select",
options: ["Self","State Agency","National Agency"],
showIf: { field: "role", value: "Organized" }
},

{
name: "agencyName",
label: "Name of Agency",
type: "text",
showIf: { field: "role", value: "Organized" }
},

{
name: "fundAmount",
label: "Amount Funded",
type: "number",
showIf: { field: "role", value: "Organized" }
},

{
name: "mode",
label: "Mode",
type: "select",
options: ["Offline","Hybrid"]
},

{
name: "level",
label: "Conference Level",
type: "select",
options: ["International","National"]
},

{
name: "monthYear",
label: "Month & Year",
type: "month"
}

],


/* ================= WORKSHOP ================= */

workshop: [
  {
    name: "title",
    label: "Workshop Title",
    type: "text",
    required: true
  },
  {
    name: "workshopType",
    label: "Workshop Type",
    type: "select",
    options: ["Attended", "Organized"],
    required: true
  },
  {
    name: "organizer",
    label: "Organizer",
    type: "text",
    required: true,
    showIf: {
      field: "workshopType",
      value: "Attended"
    }
  },
  {
    name: "mode",
    label: "Mode",
    type: "select",
    options: ["Offline", "Hybrid"],
    required: true
  },
  {
    name: "level",
    label: "Level",
    type: "select",
    options: [
      "International",
      "National",
      "State",
      "Institutional"
    ],
    required: true
  },
  {
    name: "fromDate",
    label: "From Date",
    type: "date",
    required: true
  },
  {
    name: "toDate",
    label: "To Date",
    type: "date",
    required: true
  },
  {
    name: "duration",
    label: "Duration (Days)",
    type: "number",
    readOnly: true
  }
],

/* ================= FDP ================= */

FDP: [

{
name: "title",
label: "FDP Title",
type: "text",
required: true
},

{
name: "fdpType",
label: "FDP Type",
type: "radio",
options: ["Attended", "Organized"],
required: true
},

{
name: "organizer",
label: "Organizer",
type: "text",
showIf: { field: "fdpType", value: "Attended" }
},

{
name: "mode",
label: "Mode",
type: "select",
options: [ "Offline", "Hybrid"]
},

{
name: "startDate",
label: "Start Date",
type: "date",
required: true
},

{
name: "endDate",
label: "End Date",
type: "date",
required: true
},

{
name: "duration",
label: "Duration (Days)",
type: "number"
}

],



/* ================= GUEST LECTURE ================= */

GuestLecture: [

{
name: "title",
label: "Lecture Topic",
type: "text",
required: true
},

{
name: "role",
label: "Role",
type: "select",
options: ["Delivered","Attended","Organized"],
required: true
},

{
name: "mode",
label: "Mode",
type: "select",
options: ["Offline","Hybrid"],
required: true
},

{
name: "institution",
label: "Hosting Institution / Department",
type: "text",
showIf: { field: "role", value: "Delivered" }
},

{
name: "duration",
label: "Duration (e.g. 2 Hours)",
type: "number",
required: true
},

{
name: "date",
label: "Date",
type: "date",
required: true
}

],

/* ================= SEMINAR ================= */

Seminar: [

{
name: "title",
label: "Seminar Topic",
type: "text",
required: true
},

{
name: "seminarType",
label: "Seminar Type",
type: "select",
options: ["Attended","Organized","Delivered"],
required: true
},

{
name: "speakerAgency",
label: "Name of Speaker / Agency",
type: "text",
showIf: { field: "seminarType", value: "Attended" }
},


{
name: "organization",
label: "Organization Name",
type: "text",
required: true
},

{
name: "mode",
label: "Mode",
type: "select",
options: ["Offline","Hybrid"],
required: true
},

{
name: "fromDate",
label: "From Date",
type: "date",
required: true
},

{
name: "toDate",
label: "To Date",
type: "date",
required: true
},

{
name: "duration",
label: "Duration (Days)",
type: "number",
}

],



/* ================= WEBINAR ================= */

Webinar: [

{
name: "title",
label: "Webinar Title",
type: "text",
required: true
},

{
name: "webinarType",
label: "Webinar Type",
type: "select",
options: ["Attended","Organized","Delivered"],
required: true
},

{
name: "speakerAgency",
label: "Name of Speaker / Agency",
type: "text",
showIf: { field: "webinarType", value: "Attended" }
},


{
name: "organization",
label: "Organization Name",
type: "text",
required: true
},

{
name: "mode",
label: "Mode",
type: "select",
options: ["Offline","Hybrid"]
},

{
name: "fromDate",
label: "From Date",
type: "date",
required: true
},

{
name: "toDate",
label: "To Date",
type: "date",
required: true
},

{
name: "duration",
label: "Duration (Days)",
type: "number",
}

],
/* ================= BOOK ================= */

Book: [

{
name: "bookType",
label: "Book Type",
type: "select",
options: ["Authored Book","Edited Book","Book Chapter"],
required: true
},

{
name: "title",
label: "Book / Chapter Title",
type: "text",
required: true
},

{
name: "bookTitle",
label: "Book Title",
type: "text",
required: true,
showIf: { field: "bookType", value: "Book Chapter" }
},

{
name: "publisher",
label: "Publisher",
type: "text",
required: true
},

{
name: "isbn",
label: "ISBN Number",
type: "text",
required: true
},

{
name: "year",
label: "Year of Publication",
type: "number",
required: true
}

],

/* ================= NPTEL ================= */

NPTEL: [

{
name: "courseName",
label: "Course Name",
type: "text",
required: true
},

{
name: "institute",
label: "Institute",
type: "text",
defaultValue: "NPTEL (IITs / IISc)",
readOnly: true
},

{
name: "score",
label: "Score / Percentage",
type: "number",
required: true
},

{
name: "duration",
label: "Duration (Weeks)",
type: "select",
options: ["4 Weeks","8 Weeks","12 Weeks","16 Weeks"],
required: true
},

{
name: "badge",
label: "Badge",
type: "select",
options: [
"Pass",
"Elite",
"Silver",
"Gold",
"Topper 5%",
"Topper 2%",
"Topper 1%",
"Topper of the Batch"
]
},

{
name: "monthYear",
label: "Month & Year",
type: "month",
required: true
}

],

/* ================= HONORS & AWARDS ================= */

HonorsAwards: [

{
name: "awardName",
label: "Award Name",
type: "text",
required: true
},

{
name: "awardedBy",
label: "Awarded By",
type: "text",
required: true
},

{
name: "awardYear",
label: "Awarded Year",
type: "number",
required: true
}

],

/* ================= CERTIFICATIONS ================= */

Certification: [

{
name: "title",
label: "Certificate Title",
type: "text",
required: true
},

{
name: "type",
label: "Certification Type",
type: "select",
options: ["Global","Others"],
required: true
},

{
name: "certifiedBy",
label: "Certification Given By",
type: "text",
required: true
},

{
name: "course",
label: "Course",
type: "text",
required: true
},

{
name: "fromDate",
label: "From Date",
type: "date",
required: true
},

{
name: "toDate",
label: "To Date",
type: "date",
required: true
},

{
name: "duration",
label: "Duration (Days)",
type: "number",
}

],

/* ================= RESEARCH POLICY ================= */
ResearchPolicy: [

{
name: "contributionType",
label: "Contribution Type",
type: "select",
options: ["Research Policy","R&D Committee"],
required: true
},

{
name: "policyName",
label: "Policy / Committee Name",
type: "text",
required: true
},

{
name: "committeeType",
label: "Committee Type",
type: "select",
options: [
"R&D Committee",
"IPR Committee",
"Research Advisory Committee",
"Ethics Committee",
"Other"
],
showIf: { field: "contributionType", value: "R&D Committee" }
},

{
name: "otherCommittee",
label: "Specify Committee",
type: "text",
showIf: { field: "committeeType", value: "Other" }
},

{
name: "role",
label: "Role",
type: "select",
options: [
"Member",
"Coordinator",
"Convener",
"Chairperson"
],
required: true
},

{
name: "year",
label: "Year",
type: "number",
required: true
}

],
/* ================= PROFESSIONAL MEMBERSHIP ================= */
ProfessionalMembership: [

{
name: "title",
label: "Membership Name",
type: "text",
required: true
},

{
name: "membershipType",
label: "Membership Type",
type: "select",
options: [
"Professional Society",
"Editorial Board",
"Technical Committee",
"Other"
],
required: true
},

{
name: "otherMembership",
label: "Specify Membership Type",
type: "text",
showIf: { field: "membershipType", value: "Other" }
},

{
name: "year",
label: "Awarded Year",
type: "number",
required: true
}

],
/* ================= IPR ================= */
IPR: [

{
name: "iprType",
label: "IPR Type",
type: "select",
options: [
"Design Patent",
"Copyright",
"Trademark"
],
required: true
},

{
name: "title",
label: "Patent / IPR Title",
type: "text",
required: true
},

{
name: "filedDate",
label: "Patent Filed Date",
type: "date"
},

{
name: "publishedDate",
label: "Patent Published Date",
type: "date"
},

{
name: "statusType",
label: "IPR Status",
type: "select",
options: [
"Filed",
"Published",
"Granted"
],
required: true
},

{
name: "approvalDate",
label: "Patent Approval Date",
type: "date",
showIf: { field: "statusType", value: "Granted" }
},

{
name: "authorPosition",
label: "Author Position",
type: "select",
options: [
"1",
"2",
"3",
"Others"
],
required: true
},

{
name: "otherAuthorPosition",
label: "Specify Author Position",
type: "text",
showIf: { field: "authorPosition", value: "Others" }
},

{
name: "applicantName",
label: "Applicant / Inventor Name(s)",
type: "text",
required: true
},

{
name: "organizationName",
label: "Organization / Institution Name",
type: "text",
required: true
},

{
name: "startupGuided",
label: "Startups Under Guidance / Guided",
type: "number"
}

],
/* ================= INCUBATION ================= */

Incubation: [

{
name: "title",
label: "Startup Name",
type: "text",
required: true
},

{
name: "organization",
label: "Incubation Centre",
type: "text",
required: true
},

{
name: "domain",
label: "Domain / Sector",
type: "text",
required: true
},

{
name: "year",
label: "Year",
type: "number",
required: true
},

{
name: "status",
label: "Incubation Status",
type: "select",
options: [
"Incubated",
"Ongoing",
"Graduated",
"Closed"
],
required: true
}

],
/* ================= CONSULTANCY ================= */
Consultancy: [

  {
    name: "clientName",
    label: "Client Name",
    type: "text",
    required: true
  },

  {
    name: "projectTitle",
    label: "Consultancy / Project Title",
    type: "text",
    required: true
  },

  {
    name: "consultancyType",
    label: "Consultancy Type",
    type: "select",
    options: [
      "Industry",
      "Government",
      "NGO",
      "Institutional",
      "Individual"
    ],
    required: true
  },

  {
    name: "amount",
    label: "Amount Received (₹)",
    type: "number",
    required: true
  },

  {
    name: "year",
    label: "Year",
    type: "number",
    required: true
  }

],
/* ================= MOU ================= */
mou: [
  { name: "organization", label: "Organization / Institution Name", type: "text", required: true },

  {
    name: "mouType",
    label: "MOU Type",
    type: "select",
    options: [
      "Industry",
      "Academic Institution",
      "Research Organization",
      "Government / PSU",
      "NGO",
    ],
    required: true,
  },

  { name: "purpose", label: "Purpose / Scope of Collaboration", type: "text", required: true },

  { name: "startDate", label: "Start Date", type: "date", required: true },

  { name: "endDate", label: "End Date", type: "date", required: true },

  {
    name: "status",
    label: "MOU Status",
    type: "select",
    options: ["Active", "Expired"],
    required: true,
  },
],
/* ================= RESEARCH PROJECT ================= */
researchproject: [

  {
    name: "projectTitle",
    label: "Project Title",
    type: "text",
    required: true
  },

  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    required: true
  },

  {
    name: "endDate",
    label: "End Date",
    type: "date",
    required: true
  },

  {
    name: "role",
    label: "Role in Project",
    type: "select",
    options: [
      "Principal Investigator",
      "Co-Principal Investigator",
      "Research Associate",
      "Team Member"
    ],
    required: true
  },

  {
    name: "fundingAgency",
    label: "Funding Agency",
    type: "text",
    required: true
  },

  {
    name: "grantNumber",
    label: "Grant Number",
    type: "text",
    required: false
  },

  {
    name: "amount",
    label: "Project Amount",
    type: "number",
    required: true
  },

  {
    name: "statusType",
    label: "Project Status",
    type: "select",
    options: [
      "Ongoing",
      "Completed",
      "Applied"
    ],
    required: true
  },

],
/* ================= DOCTORAL THESIS ================= */
doctoralThesis: [
  {
    name: "guidedCount",
    label: "Number of PhDs Guided",
    type: "number"
  },
  {
    name: "guidingCount",
    label: "Number of PhDs Under Guidance",
    type: "number"
  }
],

/* ================= OTHERS ================= */

Others: [

{
name: "title",
label: "Activity Title",
type: "text",
required: true
},

{
name: "type",
label: "Activity Type (FDP, Training, etc.)",
type: "text",
required: true
},

{
name: "description",
label: "Description",
type: "textarea"
},

{
name: "organizer",
label: "Organizer / Institution",
type: "text"
},

{
name: "role",
label: "Role",
type: "select",
options: ["Participant","Organizer","Speaker"]
},

{
name: "level",
label: "Level",
type: "select",
options: ["International","National","State","Institutional"]
},

{
name: "mode",
label: "Mode",
type: "select",
options: ["Offline","Hybrid"]
},

{
name: "fromDate",
label: "From Date",
type: "date",
required: true
},

{
name: "toDate",
label: "To Date",
type: "date"
},

{
name: "duration",
label: "Duration (Days/Hours)",
type: "number"
}

],
};
