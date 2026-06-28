const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");
const controller = require("../controllers/frontendApiController");

router.use(authMiddleware);

router.get("/goals", asyncHandler(controller.getGoals));
router.post("/goals", asyncHandler(controller.createGoal));

router.get("/publications", asyncHandler(controller.getPublications));
router.post("/publications", asyncHandler(controller.createPublication));

router.get("/support/faqs", asyncHandler(controller.getSupportFaqs));
router.get("/support/tickets", asyncHandler(controller.getSupportTickets));
router.post("/support/tickets", asyncHandler(controller.createSupportTicket));

router.get("/naac/reports", asyncHandler(controller.getNAACReports));
router.post("/naac/reports", asyncHandler(controller.createNAACReport));

router.get("/documents", asyncHandler(controller.getDocuments));
router.post("/documents/export", asyncHandler(controller.exportDocuments));
router.get("/cv-reports", asyncHandler(controller.getCVReports));

router.get("/faculty/public-profile", asyncHandler(controller.getFacultyPublicProfile));

router.get("/ai/insights", asyncHandler(controller.getAiInsights));
router.get("/ai/recommendations", asyncHandler(controller.getAiRecommendations));
router.get("/ai/settings", asyncHandler(controller.getAiSettings));

router.get("/insights/dashboard", asyncHandler(controller.getInsightsDashboard));
router.get("/search", asyncHandler(controller.getSearchResults));
router.get("/activity-timeline", asyncHandler(controller.getActivityTimeline));

router.get("/approvals/documents", asyncHandler(controller.getApprovalDocuments));
router.get("/approvals/documents/:id/comments", asyncHandler(controller.getApprovalComments));
router.post("/approvals/documents/:id/comment", asyncHandler(controller.addApprovalComment));

router.get("/discussions", asyncHandler(controller.getDiscussions));
router.post("/discussions/:id/reply", asyncHandler(controller.replyToDiscussion));

router.get("/system/health", roleMiddleware(ROLES.ADMIN), asyncHandler(controller.getSystemHealth));
router.get("/system/logs", roleMiddleware(ROLES.ADMIN), asyncHandler(controller.getSystemLogs));

module.exports = router;