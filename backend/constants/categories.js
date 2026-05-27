const CATEGORY_DEFINITIONS = Object.freeze({
  Publication: {
    aliases: ["publication", "publications", "paperpublication", "paperpublications"],
    section: "rnd",
    configKey: "paperPublications",
    rankingKey: "publications",
  },
  Conference: {
    aliases: ["conference", "conferences"],
    section: "professional",
    configKey: "conferences",
    rankingKey: "conferences",
  },
  Workshop: {
    aliases: ["workshop", "workshops"],
    section: "professional",
    configKey: "workshops",
    rankingKey: "workshops",
  },
  FDP: {
    aliases: ["fdp", "fdps"],
    section: "rnd",
    configKey: "fdp",
    rankingKey: "fdps",
  },
  GuestLecture: {
    aliases: ["guestlecture", "guestlectures", "guest-lecture", "guest lectures"],
    section: "professional",
    configKey: "guestLectures",
    rankingKey: "guestLectures",
  },
  Seminar: {
    aliases: ["seminar", "seminars"],
    section: "professional",
    configKey: "seminars",
    rankingKey: "seminars",
  },
  Webinar: {
    aliases: ["webinar", "webinars"],
    section: "professional",
    configKey: "webinars",
    rankingKey: "webinars",
  },
  Book: {
    aliases: ["book", "books"],
    section: "professional",
    configKey: "books",
    rankingKey: "books",
  },
  NPTEL: {
    aliases: ["nptel"],
    section: "professional",
    configKey: "nptel",
    rankingKey: "nptel",
  },
  HonorsAwards: {
    aliases: ["honorsawards", "honoursawards", "awards", "award", "honors-awards"],
    section: "professional",
    configKey: "honorsAwards",
    rankingKey: "honorsAwards",
  },
  Certification: {
    aliases: ["certification", "certifications"],
    section: "professional",
    configKey: "certifications",
    rankingKey: "certifications",
  },
  ResearchPolicy: {
    aliases: ["researchpolicy", "researchpolicies", "policy"],
    section: "rnd",
    configKey: "researchPolicy",
    rankingKey: "researchPolicies",
  },
  ProfessionalMembership: {
    aliases: ["professionalmembership", "professionalmemberships", "membership", "memberships"],
    section: "rnd",
    configKey: "professionalMemberships",
    rankingKey: "professionalMemberships",
  },
  IPR: {
    aliases: ["ipr", "iprs", "patent", "patents"],
    section: "rnd",
    configKey: "iprs",
    rankingKey: "iprs",
  },
  Incubation: {
    aliases: ["incubation", "incubations"],
    section: "rnd",
    configKey: "incubation",
    rankingKey: "incubations",
  },
  Consultancy: {
    aliases: ["consultancy", "consultancies"],
    section: "rnd",
    configKey: "consultancy",
    rankingKey: "consultancies",
  },
  MOU: {
    aliases: ["mou", "mous", "mou's"],
    section: "rnd",
    configKey: "mous",
    rankingKey: "mous",
  },
  ResearchProject: {
    aliases: ["researchproject", "researchprojects", "project", "projects"],
    section: "rnd",
    configKey: "researchProjects",
    rankingKey: "researchProjects",
  },
  DoctoralThesis: {
    aliases: ["doctoralthesis", "doctoral-thesis", "doctoral theses", "doctoralThesis"],
    section: "rnd",
    configKey: "doctoralThesis",
    rankingKey: "doctoralTheses",
  },
  Others: {
    aliases: ["others", "other"],
    section: "professional",
    configKey: "others",
    rankingKey: "others",
  },
});

const CATEGORY_ALIAS_MAP = Object.freeze(
  Object.entries(CATEGORY_DEFINITIONS).reduce((accumulator, [canonical, definition]) => {
    definition.aliases.forEach((alias) => {
      const normalizedAlias = alias.toLowerCase().replace(/[\s_-]+/g, "");
      accumulator[normalizedAlias] = canonical;
    });

    const normalizedCanonical = canonical.toLowerCase().replace(/[\s_-]+/g, "");
    accumulator[normalizedCanonical] = canonical;
    return accumulator;
  }, {})
);

function normalizeCategory(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).toLowerCase().trim().replace(/[\s_-]+/g, "");
  return CATEGORY_ALIAS_MAP[normalizedValue] || null;
}

function getCategoryConfig(value) {
  const canonical = normalizeCategory(value);
  return canonical ? { canonical, ...CATEGORY_DEFINITIONS[canonical] } : null;
}

const CATEGORY_NAMES = Object.freeze(Object.keys(CATEGORY_DEFINITIONS));

module.exports = {
  CATEGORY_ALIAS_MAP,
  CATEGORY_DEFINITIONS,
  CATEGORY_NAMES,
  getCategoryConfig,
  normalizeCategory,
};
