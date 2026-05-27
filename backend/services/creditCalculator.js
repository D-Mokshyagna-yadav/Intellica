const CreditConfig = require("../models/CreditConfig");
const CATEGORY_REGISTRY = require("../constants/categoryRegistry");

async function calculateCredits(upload) {

  try {

    const category = (upload.category || "").trim();
    const metadata = upload.metadata || {};

    console.log("========== CREDIT DEBUG ==========");
    console.log("CATEGORY:", category);
    console.log("METADATA:", metadata);

    const registry = CATEGORY_REGISTRY[category];

    if (!registry) {
      console.warn("Unknown category:", category);
      return 0;
    }

    const section = registry.section;
    const key = registry.key;

    const configDoc = await CreditConfig.findOne({ type: section }).lean();

    if (!configDoc) return 0;

    const rules = configDoc?.config?.[key];

    if (!rules) return 0;

    /* ================= PUBLICATION ================= */

    if (category === "Publication") {

      const type = metadata?.paperType;

      if (type === "Journal") {

        if (metadata?.indexing === "Scopus") {
          return rules?.Journal?.Scopus?.[metadata?.quartile] || 0;
        }

        return rules?.Journal?.[metadata?.indexing] || 0;
      }

      if (type === "Conference") {

        if (metadata?.indexing === "Scopus") {
          return rules?.Conference?.Scopus?.[metadata?.quartile] || 0;
        }

        return rules?.Conference?.[metadata?.indexing] || 0;
      }

      return rules?.Other?.Other || 0;
    }

    /* ================= CONFERENCE ================= */

    if (category === "Conference") {

      const role = (metadata?.role || "").toLowerCase();
      const level = metadata?.level;
      const mode = metadata?.mode;

      if (role === "conference presentation") {
        return rules?.conferencePresentation?.[level]?.[mode] || 0;
      }

      if (role === "participation") {
        return rules?.participation?.[level]?.[mode] || 0;
      }

      if (role === "organized") {
        return rules?.organized?.[level]?.[mode] || 0;
      }

      return 0;
    }

    /* ================= WORKSHOP ================= */

if (category === "workshop") {

  const type = (metadata?.workshopType || "").toLowerCase();
  const level = (metadata?.level || "").trim();
  const mode = (metadata?.mode || "").trim();
  const days = Number(metadata?.duration || 1);

  console.log("WORKSHOP TYPE:", type);
  console.log("WORKSHOP LEVEL:", level);
  console.log("WORKSHOP MODE:", mode);

  const base = rules?.[type]?.[level]?.[mode]?.base || 0;
  const perDay = rules?.[type]?.[level]?.[mode]?.perDay || 0;

  console.log("BASE:", base);
  console.log("PER DAY:", perDay);

  return base + days * perDay;
}

    /* ================= GUEST LECTURE ================= */

    if (category === "GuestLecture") {

      const role = (metadata?.role || "").toLowerCase();
      const mode = metadata?.mode;
      const hours = Number(metadata?.duration || 1);

      const base = rules?.[role]?.[mode]?.base || 0;
      const perHour = rules?.[role]?.[mode]?.perHour || 0;

      return base + hours * perHour;
    }

    /* ================= SEMINAR ================= */

    if (category === "Seminar") {

      const type = (metadata?.seminarType || "").toLowerCase();
      const mode = metadata?.mode;
      const days = Number(metadata?.duration || 1);

      const base = rules?.[type]?.[mode]?.base || 0;
      const perDay = rules?.[type]?.[mode]?.perDay || 0;

      return base + days * perDay;
    }

    /* ================= WEBINAR ================= */

    if (category === "Webinar") {

      const type = (metadata?.webinarType || "").toLowerCase();
      const mode = metadata?.mode;
      const days = Number(metadata?.duration || 1);

      const base = rules?.[type]?.[mode]?.base || 0;
      const perDay = rules?.[type]?.[mode]?.perDay || 0;

      return base + days * perDay;
    }

    /* ================= BOOK ================= */

    if (category === "Book") {
      return rules?.[metadata?.bookType] || 0;
    }

    /* ================= NPTEL ================= */

    if (category === "NPTEL") {

      const duration = metadata?.duration;
      const badge = metadata?.badge || "Pass";

      return rules?.[duration]?.[badge] || 0;
    }

    /* ================= HONORS ================= */

    if (category === "HonorsAwards") {
      return rules?.Award || 0;
    }

    /* ================= CERTIFICATION ================= */

    if (category === "Certification") {

      const type = metadata?.type;
      const days = Number(metadata?.duration || 1);

      const perDay = rules?.[type]?.perDay || 0;

      return days * perDay;
    }

    /* ================= RESEARCH POLICY ================= */

    if (category === "ResearchPolicy") {

      const type = metadata?.contributionType;
      const role = metadata?.role;

      return rules?.[type]?.[role] || 0;
    }
    /* ================= FDP ================= */

if (category === "FDP") {

  const type = (metadata?.fdpType || "").toLowerCase();
  const mode = metadata?.mode;
  const days = Number(metadata?.duration || 1);

  console.log("FDP TYPE:", type);
  console.log("FDP MODE:", mode);
  console.log("FDP DAYS:", days);

  const perDay = rules?.[type]?.[mode]?.perDay || 0;

  console.log("FDP PER DAY:", perDay);

  return days * perDay;
}
    /* ================= MEMBERSHIP ================= */

    if (category === "ProfessionalMembership") {
      return rules?.[metadata?.membershipType] || 0;
    }

    /* ================= IPR ================= */

    if (category === "IPR") {

      const base = rules?.typeCredits?.[metadata?.iprType] || 0;

      const statusMultiplier =
        rules?.statusMultiplier?.[metadata?.statusType] || 1;

      const authorMultiplier =
        rules?.authorPositionMultiplier?.[metadata?.authorPosition] || 1;

      return base * statusMultiplier * authorMultiplier;
    }

    /* ================= INCUBATION ================= */

    if (category === "Incubation") {
      return rules?.[metadata?.status] || 0;
    }

    /* ================= CONSULTANCY ================= */

    if (category === "Consultancy") {

      const base = rules?.typeCredits?.[metadata?.consultancyType] || 0;

      const multiplier = rules?.amountMultiplier?.perLakh || 0;

      const amount = Number(metadata?.amount || 0);

      const lakhs = amount / 100000;

      return base + lakhs * multiplier;
    }

    /* ================= MOU ================= */

    if (category === "mou")  {

      const base = rules?.typeCredits?.[metadata?.mouType] || 0;

      const status = rules?.statusMultiplier?.[metadata?.status] || 1;

      return base * status;
    }

    /* ================= RESEARCH PROJECT ================= */

    if (category === "researchproject") {

      const role = rules?.roleCredits?.[metadata?.role] || 0;

      const multiplier =
        rules?.statusMultiplier?.[metadata?.statusType] || 1;

      return role * multiplier;
    }

    /* ================= DOCTORAL THESIS ================= */

    if (category === "doctoralThesis")  {

      const guided =
        Number(metadata?.guidedCount || 0) *
        (rules?.Guided?.perScholar || 0);

      const guiding =
        Number(metadata?.guidingCount || 0) *
        (rules?.Guiding?.perScholar || 0);

      return guided + guiding;
    }
    /* ================= OTHERS ================= */

if (category === "Others") {

  const days = Number(metadata?.duration || 1);

  const base = rules?.base || 0;
  const perDay = rules?.perDay || 0;

  console.log("OTHERS BASE:", base);
  console.log("OTHERS PER DAY:", perDay);
  console.log("OTHERS DAYS:", days);

  return base + days * perDay;
}
    return 0;

  } catch (error) {

    console.error("Credit calculation error:", error);
    return 0;

  }

}

module.exports = calculateCredits;