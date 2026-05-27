const CreditConfig = require("../models/CreditConfig");
const { getCategoryConfig } = require("../constants/categories");
const logger = require("../utils/logger");

async function calculateCredits(upload) {
  try {
    const metadata = upload.metadata || {};
    const categoryConfig = getCategoryConfig(upload.category);

    if (!categoryConfig) {
      return 0;
    }

    const configDoc = await CreditConfig.findOne({ type: categoryConfig.section }).lean();
    if (!configDoc) {
      return 0;
    }

    const rules = configDoc?.config?.[categoryConfig.configKey];
    if (!rules) {
      return 0;
    }

    switch (categoryConfig.canonical) {
      case "Publication": {
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
      case "Conference": {
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
      case "Workshop": {
        const type = (metadata?.workshopType || "").toLowerCase();
        const level = (metadata?.level || "").trim();
        const mode = (metadata?.mode || "").trim();
        const days = Number(metadata?.duration || 1);
        const base = rules?.[type]?.[level]?.[mode]?.base || 0;
        const perDay = rules?.[type]?.[level]?.[mode]?.perDay || 0;
        return base + days * perDay;
      }
      case "GuestLecture": {
        const role = (metadata?.role || "").toLowerCase();
        const mode = metadata?.mode;
        const hours = Number(metadata?.duration || 1);
        const base = rules?.[role]?.[mode]?.base || 0;
        const perHour = rules?.[role]?.[mode]?.perHour || 0;
        return base + hours * perHour;
      }
      case "Seminar": {
        const type = (metadata?.seminarType || "").toLowerCase();
        const mode = metadata?.mode;
        const days = Number(metadata?.duration || 1);
        const base = rules?.[type]?.[mode]?.base || 0;
        const perDay = rules?.[type]?.[mode]?.perDay || 0;
        return base + days * perDay;
      }
      case "Webinar": {
        const type = (metadata?.webinarType || "").toLowerCase();
        const mode = metadata?.mode;
        const days = Number(metadata?.duration || 1);
        const base = rules?.[type]?.[mode]?.base || 0;
        const perDay = rules?.[type]?.[mode]?.perDay || 0;
        return base + days * perDay;
      }
      case "Book":
        return rules?.[metadata?.bookType] || 0;
      case "NPTEL":
        return rules?.[metadata?.duration]?.[metadata?.badge || "Pass"] || 0;
      case "HonorsAwards":
        return rules?.Award || 0;
      case "Certification": {
        const type = metadata?.type;
        const days = Number(metadata?.duration || 1);
        const perDay = rules?.[type]?.perDay || 0;
        return days * perDay;
      }
      case "ResearchPolicy":
        return rules?.[metadata?.contributionType]?.[metadata?.role] || 0;
      case "FDP": {
        const type = (metadata?.fdpType || "").toLowerCase();
        const mode = metadata?.mode;
        const days = Number(metadata?.duration || 1);
        const perDay = rules?.[type]?.[mode]?.perDay || 0;
        return days * perDay;
      }
      case "ProfessionalMembership":
        return rules?.[metadata?.membershipType] || 0;
      case "IPR": {
        const base = rules?.typeCredits?.[metadata?.iprType] || 0;
        const statusMultiplier = rules?.statusMultiplier?.[metadata?.statusType] || 1;
        const authorMultiplier = rules?.authorPositionMultiplier?.[metadata?.authorPosition] || 1;
        return base * statusMultiplier * authorMultiplier;
      }
      case "Incubation":
        return rules?.[metadata?.status] || 0;
      case "Consultancy": {
        const base = rules?.typeCredits?.[metadata?.consultancyType] || 0;
        const multiplier = rules?.amountMultiplier?.perLakh || 0;
        const amount = Number(metadata?.amount || 0);
        return base + amount / 100000 * multiplier;
      }
      case "MOU": {
        const base = rules?.typeCredits?.[metadata?.mouType] || 0;
        const status = rules?.statusMultiplier?.[metadata?.status] || 1;
        return base * status;
      }
      case "ResearchProject": {
        const role = rules?.roleCredits?.[metadata?.role] || 0;
        const multiplier = rules?.statusMultiplier?.[metadata?.statusType] || 1;
        return role * multiplier;
      }
      case "DoctoralThesis": {
        const guided = Number(metadata?.guidedCount || 0) * (rules?.Guided?.perScholar || 0);
        const guiding = Number(metadata?.guidingCount || 0) * (rules?.Guiding?.perScholar || 0);
        return guided + guiding;
      }
      case "Others": {
        const days = Number(metadata?.duration || 1);
        const base = rules?.base || 0;
        const perDay = rules?.perDay || 0;
        return base + days * perDay;
      }
      default:
        return 0;
    }
  } catch (error) {
    logger.error({ err: error, category: upload.category }, "Credit calculation error");
    return 0;
  }
}

module.exports = calculateCredits;
